"""Poker Coach - 牌力评估引擎

基于 treys 库实现德州扑克牌力评估。
"""
from __future__ import annotations

import itertools
from typing import Tuple

from treys import Card, Evaluator

_evaluator = Evaluator()

# rank_class → 中文牌型名
RANK_NAMES_ZH: dict[int, str] = {
    0: "皇家同花顺 🃏",
    1: "同花顺 ♠️",
    2: "四条 🎯",
    3: "葫芦 🏠",
    4: "同花 🌊",
    5: "顺子 📏",
    6: "三条 🔱",
    7: "两对 ✌️",
    8: "一对 👆",
    9: "高牌 📈",
}

# rank_class → 英文牌型名
RANK_NAMES_EN: dict[int, str] = {
    0: "Royal Flush",
    1: "Straight Flush",
    2: "Four of a Kind",
    3: "Full House",
    4: "Flush",
    5: "Straight",
    6: "Three of a Kind",
    7: "Two Pair",
    8: "Pair",
    9: "High Card",
}


def str_to_card(card_str: str) -> int:
    """将字符串转为 treys Card int。
    
    Args:
        card_str: 如 'Ah', 'Kd', 'Tc', '2s'
    
    Returns:
        treys 内部使用的整数牌值
    """
    return Card.new(card_str)


def card_to_str(card_int: int) -> str:
    """将 treys Card int 转为字符串。"""
    return Card.int_to_str(card_int)


def cards_to_strs(card_ints: list[int]) -> list[str]:
    """批量转换。"""
    return [Card.int_to_str(c) for c in card_ints]


def parse_cards(card_strings: list[str]) -> list[int]:
    """批量解析字符串为 treys card ints。"""
    return [Card.new(s) for s in card_strings]


def validate_cards(card_strings: list[str]) -> tuple[bool, str]:
    """检查牌面字符串是否合法。
    
    Returns:
        (is_valid, error_message)
    """
    if not card_strings:
        return True, ""
    
    seen = set()
    for s in card_strings:
        s = s.strip().upper()
        if len(s) != 2:
            return False, f"'{s}' 格式错误，应为 2 字符（如 'Ah'）"
        rank, suit = s[0], s[1]
        if rank not in "23456789TJQKA":
            return False, f"'{s}' 中 '{rank}' 不是合法牌面（2-9,T,J,Q,K,A）"
        if suit not in "cdhsCDHS":
            return False, f"'{s}' 中 '{suit}' 不是合法花色（c,d,h,s）"
        if s in seen:
            return False, f"'{s}' 重复"
        seen.add(s)
    return True, ""


def evaluate_hand(
    hole_cards: list[int], board_cards: list[int]
) -> dict:
    """评估手牌 + 公共牌的牌力。
    
    Args:
        hole_cards: 手牌 (list of treys ints)
        board_cards: 公共牌 (list of treys ints)
    
    Returns:
        {
            "score": int,        # 越小越好，1=皇家同花顺
            "rank_class": int,   # 0-9
            "rank_name_zh": str, # 中文牌型名
            "rank_name_en": str, # 英文牌型名
        }
    """
    score = _evaluator.evaluate(board_cards, hole_cards)
    rank_class = _evaluator.get_rank_class(score)
    return {
        "score": score,
        "rank_class": rank_class,
        "rank_name_zh": RANK_NAMES_ZH[rank_class],
        "rank_name_en": RANK_NAMES_EN[rank_class],
    }


def compare_hands(
    hand1: list[int],
    hand2: list[int],
    board_cards: list[int],
) -> tuple[int, int, int]:
    """比较两手牌在相同公共牌下的胜负。
    
    Returns:
        (win, tie, lose): 1 表示 hand1赢了/平局/输了
        只会有一个值为 1，其余为 0
    """
    s1 = _evaluator.evaluate(board_cards, hand1)
    s2 = _evaluator.evaluate(board_cards, hand2)
    if s1 < s2:
        return 1, 0, 0
    elif s1 == s2:
        return 0, 1, 0
    else:
        return 0, 0, 1


def get_best_five(
    hole_cards: list[int], board_cards: list[int]
) -> tuple[list[int], dict]:
    """从 7 张牌（2手+5公）中找出最好的 5 张组合。
    
    Returns:
        (best_five_cards, hand_info)
        - best_five_cards: 最好的 5 张牌 (treys ints)
        - hand_info: evaluate_hand 返回的 dict
    """
    all_cards = board_cards + hole_cards
    if len(all_cards) <= 5:
        # 直接评估
        info = evaluate_hand(hole_cards, board_cards)
        return all_cards, info

    best_score = 9999
    best_five = None
    best_info = None

    for combo in itertools.combinations(all_cards, 5):
        # 对 5 张牌：评估时将 combo 视为 board，手牌为空
        score = _evaluator.evaluate(list(combo), [])
        if score < best_score:
            best_score = score
            best_five = list(combo)
            rank_class = _evaluator.get_rank_class(score)
            best_info = {
                "score": score,
                "rank_class": rank_class,
                "rank_name_zh": RANK_NAMES_ZH[rank_class],
                "rank_name_en": RANK_NAMES_EN[rank_class],
            }

    return best_five, best_info


def get_hand_rank_name(score: int, lang: str = "zh") -> str:
    """从 score 直接获取牌型名。"""
    rank_class = _evaluator.get_rank_class(score)
    if lang == "zh":
        return RANK_NAMES_ZH.get(rank_class, "未知")
    return RANK_NAMES_EN.get(rank_class, "Unknown")
