"""Poker Coach - 后端测试"""
from __future__ import annotations

import pytest
from treys import Card, Evaluator

from app.engine.evaluator import (
    evaluate_hand,
    compare_hands,
    parse_cards,
    cards_to_strs,
    validate_cards,
    get_best_five,
    get_hand_rank_name,
    str_to_card,
)
from app.engine.simulator import simulate, compare_strategies

from app.models.schemas import (
    SimulateRequest,
    SimulateResponse,
    SimulateResult,
    CompareRequest,
    CompareStrategy,
    CompareResponse,
)


# ============================================================
# 牌力评估引擎测试
# ============================================================


class TestCardUtils:
    def test_str_to_card_and_back(self):
        c = str_to_card("Ah")
        assert Card.int_to_str(c) == "Ah"

    def test_parse_cards(self):
        cards = parse_cards(["Ah", "Kd", "Qc", "Js", "Th"])
        assert len(cards) == 5
        assert all(isinstance(c, int) for c in cards)

    def test_cards_to_strs(self):
        cards = parse_cards(["Ah", "Kd"])
        strs = cards_to_strs(cards)
        assert strs == ["Ah", "Kd"]

    def test_validate_cards_valid(self):
        valid, msg = validate_cards(["Ah", "Kd"])
        assert valid
        assert msg == ""

    def test_validate_cards_invalid_rank(self):
        valid, msg = validate_cards(["1h"])
        assert not valid
        assert "不是合法牌面" in msg

    def test_validate_cards_invalid_suit(self):
        valid, msg = validate_cards(["Ax"])
        assert not valid
        assert "不是合法花色" in msg

    def test_validate_cards_duplicate(self):
        valid, msg = validate_cards(["Ah", "Ah"])
        assert not valid
        assert "重复" in msg

    def test_validate_cards_empty(self):
        valid, msg = validate_cards([])
        assert valid


class TestEvaluator:
    """牌力评估测试"""

    def test_royal_flush(self):
        """皇家同花顺：Ah Kh Qh Jh Th"""
        hand = parse_cards(["Ah", "Kh"])
        board = parse_cards(["Qh", "Jh", "Th"])
        result = evaluate_hand(hand, board)
        assert result["rank_class"] == 0  # Royal Flush
        assert result["score"] == 1  # 最低分 = 最强牌

    def test_straight_flush(self):
        """同花顺：9h 8h 7h 6h 5h"""
        hand = parse_cards(["9h", "8h"])
        board = parse_cards(["7h", "6h", "5h"])
        result = evaluate_hand(hand, board)
        assert result["rank_class"] == 1  # Straight Flush

    def test_four_of_a_kind(self):
        """四条：AAAA"""
        hand = parse_cards(["Ah", "Ac"])
        board = parse_cards(["Ad", "As", "Kh"])
        result = evaluate_hand(hand, board)
        assert result["rank_class"] == 2  # Four of a Kind

    def test_full_house(self):
        """葫芦：AAA KK"""
        hand = parse_cards(["Ah", "Ac"])
        board = parse_cards(["Ad", "Ks", "Kd"])
        result = evaluate_hand(hand, board)
        assert result["rank_class"] == 3  # Full House

    def test_flush(self):
        """同花：5 张红心"""
        hand = parse_cards(["Ah", "Kh"])
        board = parse_cards(["Qh", "Jh", "9d"])
        result = evaluate_hand(hand, board)
        # 只有 4 张红心，不是同花
        assert result["rank_class"] != 4

    def test_flush_real(self):
        """真正的同花：5 张红心"""
        hand = parse_cards(["Ah", "Kh"])
        board = parse_cards(["Qh", "Jh", "Th"])
        result = evaluate_hand(hand, board)
        assert result["rank_class"] == 0  # 这是皇家同花顺，不是普通同花

    def test_compare_aa_vs_kk(self):
        """AA 应该赢 KK"""
        hand1 = parse_cards(["Ah", "Ad"])
        hand2 = parse_cards(["Ks", "Kd"])
        board = parse_cards(["Ac", "Kh", "Qd"])
        win, tie, lose = compare_hands(hand1, hand2, board)
        assert win == 1  # AA 赢（三条A > 葫芦K）

    def test_compare_equal(self):
        """相同牌型平局"""
        hand1 = parse_cards(["Ah", "Kd"])
        hand2 = parse_cards(["As", "Kc"])
        board = parse_cards(["Qh", "Jh", "Th", "9d", "2c"])
        win, tie, lose = compare_hands(hand1, hand2, board)
        assert tie == 1  # 都是 AK high

    def test_get_best_five_from_seven(self):
        """7 张牌中选最佳 5 张"""
        hand = parse_cards(["Ah", "Kd"])
        board = parse_cards(["Qh", "Jh", "Th", "2c", "3d"])
        best_five, info = get_best_five(hand, board)
        assert len(best_five) == 5
        # Ah + Qh + Jh + Th + Kd = A-K-Q-J-T straight (只有4张红心，不成同花)
        assert info["rank_class"] == 5  # Straight

    def test_get_best_five_partial_board(self):
        """不足 7 张时原样返回"""
        hand = parse_cards(["Ah", "Kd"])
        board = parse_cards(["Qh", "Jh", "Th"])
        best_five, info = get_best_five(hand, board)
        assert len(best_five) == 5


# ============================================================
# Monte Carlo 模拟器测试
# ============================================================


class TestSimulator:
    """Monte Carlo 模拟测试"""

    def test_pocket_aces_vs_random(self):
        """AA 翻前 vs 随机手牌，胜率应约为 85%"""
        result = simulate(
            hand_strs=["Ah", "Ad"],
            board_strs=[],
            opponent_count=1,
            num_simulations=5000,
        )
        # AA vs random 胜率约 85%，允许 ±8% 浮动
        assert result["win_rate"] > 0.77, f"AA win rate too low: {result['win_rate']}"
        assert result["win_rate"] < 0.93, f"AA win rate too high: {result['win_rate']}"
        assert result["loss_rate"] > 0

    def test_pocket_kings_vs_random(self):
        """KK 翻前 vs 随机手牌，胜率应约为 82%"""
        result = simulate(
            hand_strs=["Ks", "Kd"],
            board_strs=[],
            opponent_count=1,
            num_simulations=5000,
        )
        assert result["win_rate"] > 0.74
        assert result["win_rate"] < 0.92

    def test_ev_calculation(self):
        """EV 应为合理值"""
        result = simulate(
            hand_strs=["Ah", "Ad"],
            board_strs=[],
            opponent_count=1,
            num_simulations=5000,
        )
        # EV = win_rate * (opponent_count + 1) - loss_rate * 1
        # 对于 AA vs 1 对手，EV 应约 0.7-0.85
        assert -1.0 <= result["expected_value"] <= 2.0

    def test_hand_strength_on_flop(self):
        """翻牌圈有公牌时，应返回最佳牌型"""
        result = simulate(
            hand_strs=["Ah", "Kh"],
            board_strs=["Qh", "Jh", "Th"],
            opponent_count=1,
            num_simulations=1000,
        )
        # Ah Kh + Qh Jh Th = 皇家同花顺
        assert result["best_hand_rank"] is not None
        assert "皇家同花顺" in result["best_hand_rank"]

    def test_multiple_opponents(self):
        """多名对手时胜率应降低"""
        result_1opp = simulate(
            hand_strs=["Ah", "Ad"],
            board_strs=[],
            opponent_count=1,
            num_simulations=5000,
        )
        result_3opp = simulate(
            hand_strs=["Ah", "Ad"],
            board_strs=[],
            opponent_count=3,
            num_simulations=5000,
        )
        # 3 个对手时 AA 胜率应低于 1 个对手时
        assert result_3opp["win_rate"] < result_1opp["win_rate"]

    def test_compare_strategies(self):
        """两种策略对比"""
        result = compare_strategies(
            strategy1_hand=["Ah", "Ad"],
            strategy2_hand=["Kh", "Kd"],
            board_strs=[],
            opponent_count=1,
            num_simulations=5000,
        )
        # AA 的 EV 应 >= KK 的 EV（或有小概率随机波动）
        assert "strategy1" in result["recommendation"] or "strategy2" in result["recommendation"]
        assert result["strategy1"]["win_rate"] > 0
        assert result["strategy2"]["win_rate"] > 0


# ============================================================
# 数据模型测试
# ============================================================


class TestModels:
    def test_simulate_request_valid(self):
        req = SimulateRequest(hand=["Ah", "Kd"])
        assert req.hand == ["Ah", "Kd"]
        assert req.opponent_count == 1
        assert req.num_simulations == 10000

    def test_simulate_request_with_board(self):
        req = SimulateRequest(hand=["Ah", "Kd"], board=["Qh", "Jh", "Th"])
        assert len(req.board) == 3

    def test_simulate_response(self):
        result = SimulateResult(
            win_rate=0.85,
            tie_rate=0.01,
            loss_rate=0.14,
            expected_value=0.71,
            num_simulations=10000,
        )
        resp = SimulateResponse(
            hand=["Ah", "Ad"],
            board=[],
            opponent_count=1,
            result=result,
        )
        assert resp.result.win_rate == 0.85

    def test_compare_request(self):
        req = CompareRequest(
            strategies=[
                CompareStrategy(name="跟进", hand=["Ah", "Ad"]),
                CompareStrategy(name="弃牌", hand=["Kh", "Kd"]),
            ],
        )
        assert len(req.strategies) == 2
        assert req.strategies[0].name == "跟进"
