"""Poker Coach - API 路由"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.engine.evaluator import (
    evaluate_hand,
    parse_cards,
    cards_to_strs,
    validate_cards,
    get_best_five,
)
from app.engine.simulator import simulate, compare_strategies
from app.models.schemas import (
    SimulateRequest,
    SimulateResponse,
    SimulateResult,
    CompareRequest,
    CompareResponse,
    CompareResult,
    HandInfo,
)

router = APIRouter(prefix="/api", tags=["poker"])


@router.post("/simulate", response_model=SimulateResponse)
async def api_simulate(req: SimulateRequest):
    """Monte Carlo 模拟：给定手牌和公共牌，计算胜率/EV。"""
    # 校验手牌
    valid, err = validate_cards(req.hand)
    if not valid:
        raise HTTPException(status_code=400, detail=f"手牌格式错误: {err}")

    # 校验公牌
    if req.board:
        valid, err = validate_cards(req.board)
        if not valid:
            raise HTTPException(status_code=400, detail=f"公共牌格式错误: {err}")

    # 检查牌面不重复（手牌和公牌之间）
    all_cards = set(req.hand) | set(req.board)
    if len(all_cards) != len(req.hand) + len(req.board):
        raise HTTPException(status_code=400, detail="手牌和公牌中有重复牌")

    # 检查总牌数不超（2 手牌 + 最多 5 公牌)
    if len(req.board) > 5:
        raise HTTPException(status_code=400, detail="公共牌不能超过 5 张")

    try:
        result = simulate(
            req.hand,
            req.board,
            opponent_count=req.opponent_count,
            num_simulations=req.num_simulations,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"模拟出错: {str(e)}")

    return SimulateResponse(
        hand=req.hand,
        board=req.board,
        opponent_count=req.opponent_count,
        result=SimulateResult(**result),
    )


@router.post("/evaluate")
async def api_evaluate(hand: list[str], board: list[str] = []):
    """评估当前牌力（仅评估，不做模拟）。"""
    valid, err = validate_cards(hand)
    if not valid:
        raise HTTPException(status_code=400, detail=f"手牌格式错误: {err}")
    if board:
        valid, err = validate_cards(board)
        if not valid:
            raise HTTPException(status_code=400, detail=f"公共牌格式错误: {err}")

    all_cards = hand + board
    # 去重检查
    if len(set(all_cards)) != len(all_cards):
        raise HTTPException(status_code=400, detail="牌面有重复")

    hole = parse_cards(hand)
    bd = parse_cards(board)

    if len(bd) + len(hole) < 5:
        # 不足 5 张，只能显示手牌强度，不能完全评估
        from treys import Card as TreysCard
        return {
            "hand": hand,
            "board": board,
            "info": "牌面不足 5 张，无法完成评估，请补充公牌",
        }

    info = evaluate_hand(hole, bd)
    best_five, _ = get_best_five(hole, bd)

    return {
        "hand": hand,
        "board": board,
        "score": info["score"],
        "rank_class": info["rank_class"],
        "rank_name_zh": info["rank_name_zh"],
        "rank_name_en": info["rank_name_en"],
        "best_five_cards": cards_to_strs(best_five),
    }


@router.post("/compare", response_model=CompareResponse)
async def api_compare(req: CompareRequest):
    """对比两种打法的 EV。"""
    strategies = req.strategies
    if len(strategies) != 2:
        raise HTTPException(status_code=400, detail="必须提供两种策略")

    # 校验所有手牌
    for s in strategies:
        valid, err = validate_cards(s.hand)
        if not valid:
            raise HTTPException(status_code=400, detail=f"策略 '{s.name}' 手牌格式错误: {err}")

    # 校验公牌
    if req.board:
        valid, err = validate_cards(req.board)
        if not valid:
            raise HTTPException(status_code=400, detail=f"公共牌格式错误: {err}")

    # 去重检查
    all_cards = set(req.board)
    for s in strategies:
        for c in s.hand:
            if c in all_cards:
                raise HTTPException(status_code=400, detail=f"策略 '{s.name}' 的手牌 '{c}' 与已有牌重复")
            all_cards.add(c)

    try:
        r1 = simulate(
            strategies[0].hand, req.board,
            opponent_count=req.opponent_count,
            num_simulations=req.num_simulations,
        )
        r2 = simulate(
            strategies[1].hand, req.board,
            opponent_count=req.opponent_count,
            num_simulations=req.num_simulations,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"模拟出错: {str(e)}")

    results = [
        CompareResult(
            name=strategies[0].name,
            hand=strategies[0].hand,
            win_rate=r1["win_rate"],
            tie_rate=r1["tie_rate"],
            loss_rate=r1["loss_rate"],
            expected_value=r1["expected_value"],
        ),
        CompareResult(
            name=strategies[1].name,
            hand=strategies[1].hand,
            win_rate=r2["win_rate"],
            tie_rate=r2["tie_rate"],
            loss_rate=r2["loss_rate"],
            expected_value=r2["expected_value"],
        ),
    ]

    # 推荐 EV 更高的策略
    if r1["expected_value"] >= r2["expected_value"]:
        rec = strategies[0].name
    else:
        rec = strategies[1].name

    return CompareResponse(
        board=req.board,
        opponent_count=req.opponent_count,
        num_simulations=req.num_simulations,
        strategies=results,
        recommendation=rec,
    )
