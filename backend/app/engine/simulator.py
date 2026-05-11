"""Poker Coach - Monte Carlo 模拟器

通过大量随机模拟计算胜率、EV 等统计指标。
"""
from __future__ import annotations

import random
from typing import Tuple

from treys import Card, Deck

from app.engine.evaluator import (
    _evaluator,
    evaluate_hand,
    compare_hands,
    parse_cards,
    cards_to_strs,
    get_best_five,
)


def _remove_cards_from_deck(deck_cards: list[int], exclude: list[int]) -> list[int]:
    """从牌堆中移除指定的牌。"""
    exclude_set = frozenset(exclude)
    return [c for c in deck_cards if c not in exclude_set]


def simulate(
    hand_strs: list[str],
    board_strs: list[str],
    opponent_count: int = 1,
    num_simulations: int = 10000,
) -> dict:
    """Monte Carlo 模拟。
    
    Args:
        hand_strs: 手牌字符串列表，如 ['Ah', 'Kd']
        board_strs: 公共牌字符串列表，可 0-5 张
        opponent_count: 对手数量 (1-9)
        num_simulations: 模拟次数
    
    Returns:
        {
            "win_rate": float,
            "tie_rate": float,
            "loss_rate": float,
            "expected_value": float,
            "num_simulations": int,
            "best_hand_rank": str | None,
            "best_hand_cards": list[str] | None,
        }
    """
    hand = parse_cards(hand_strs)
    board = parse_cards(board_strs)
    known_cards = hand + board

    wins = 0
    ties = 0
    losses = 0

    # 用于追踪最佳成牌（只在 flop/turn/river 有公牌时才有效）
    best_score = 9999
    best_five = None

    # 已知牌数
    known_count = len(known_cards)
    # 需要补全的牌数：总应有 5 张公牌
    board_needed_count = max(0, 5 - len(board))
    # 每个对手需要 2 张手牌
    opp_cards_needed = opponent_count * 2
    # 剩余 deck 中需要的总牌数
    needed = board_needed_count + opp_cards_needed

    for _ in range(num_simulations):
        # 创建一副牌并移除已知牌
        full_deck = Deck().cards  # 返回列表
        available = _remove_cards_from_deck(full_deck, known_cards)

        # 洗牌
        random.shuffle(available)

        # 取出所需的牌
        drawn = available[:needed]

        # 补全公牌
        remaining_board = board + drawn[:board_needed_count]

        # 自己的得分
        my_score = _evaluator.evaluate(remaining_board, hand)

        # 追踪最佳成牌
        if my_score < best_score:
            best_score = my_score
            if len(remaining_board) + len(hand) >= 5:
                best_five, _ = get_best_five(hand, remaining_board)

        # 每个对手
        idx = board_needed_count
        my_best = True   # 假设自己领先
        is_tie = False

        for opp_idx in range(opponent_count):
            opp_hand = drawn[idx: idx + 2]
            idx += 2
            opp_score = _evaluator.evaluate(remaining_board, opp_hand)

            if opp_score < my_score:
                my_best = False
                break
            elif opp_score == my_score:
                is_tie = True

        if my_best and not is_tie:
            wins += 1
        elif is_tie and my_best:
            ties += 1
        else:
            losses += 1

    total = num_simulations
    win_rate = wins / total
    tie_rate = ties / total
    loss_rate = losses / total

    # EV 计算：假设所有玩家均投入 1 单位底池
    # 赢时获得 (opponent_count + 1) 单位（自己的+对手的投入），输时损失 1 单位
    # EV = win_rate * (对手数 + 1) - loss_rate * 1 + tie_rate * 0
    # 更直观：每个对手投入 1，底池 total_pot = opponent_count + 1
    # 胜时获得 total_pot，输时损失 1，平局退回 1
    ev = win_rate * (opponent_count + 1) - loss_rate * 1 + tie_rate * 0
    # 归一化到底池百分比
    ev_normalized = ev / (opponent_count + 1)

    result = {
        "win_rate": round(win_rate, 6),
        "tie_rate": round(tie_rate, 6),
        "loss_rate": round(loss_rate, 6),
        "expected_value": round(ev, 6),
        "num_simulations": total,
    }

    # 只有有公牌时才返回最佳成牌信息
    if best_five is not None and len(board) > 0:
        _, best_info = get_best_five(hand, board + [])  # 用实际牌面获取最新评估
        result["best_hand_rank"] = best_info["rank_name_zh"]
        result["best_hand_cards"] = cards_to_strs(best_five)

    return result


def compare_strategies(
    strategy1_hand: list[str],
    strategy2_hand: list[str],
    board_strs: list[str],
    opponent_count: int = 1,
    num_simulations: int = 10000,
) -> dict:
    """对比两种不同手牌策略的 EV。
    
    Returns:
        {
            "strategy1": { ... simulate result ... },
            "strategy2": { ... simulate result ... },
            "recommendation": "strategy1" or "strategy2",
        }
    """
    r1 = simulate(strategy1_hand, board_strs, opponent_count, num_simulations)
    r2 = simulate(strategy2_hand, board_strs, opponent_count, num_simulations)

    # 注意：两个模拟使用不同随机种子，结果会有波动
    # 更适合的做法是复用相同随机局面，但这里简化
    if r1["expected_value"] >= r2["expected_value"]:
        recommendation = "strategy1"
    else:
        recommendation = "strategy2"

    return {
        "strategy1": r1,
        "strategy2": r2,
        "recommendation": recommendation,
    }
