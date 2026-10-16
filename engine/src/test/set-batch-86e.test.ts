/**
 * Set walk batch 86, part e (2026-10-15): Bloomburrow (BLB), Bloomburrow Commander (BLC), Mystery Booster 2 (MB2) and Assassin's Creed (ACR), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const lastRoll = (game: Game): number => game.state.lastRoll?.total ?? 0;

/** `count` of the token `token` for `player`, made by an effect (real tokens). */
function makeTokens(game: Game, token: string, count: number, player = A): void {
  game.debugApplyEffect(player, { kind: "create-token", token, count });
  settle(game);
}

describe("Calamitous Tide", () => {
  it("returns up to two creatures to their owners' hands, then you draw two and discard one", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const theirs = hand(game, B).length;
    const tide = toHand(game, "Calamitous Tide");
    const mine = hand(game).length;
    pickTargets(a, bears, giant);
    cast(game, tide, { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(hand(game, B).length).toBe(theirs + 2);
    // The Tide left the hand; +2 drawn, -1 discarded.
    expect(hand(game).length).toBe(mine - 1 + 2 - 1);
    expect(graveyard(game).length).toBe(2);
  });

  it("with no targets chosen, still draws and discards", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const tide = toHand(game, "Calamitous Tide");
    const mine = hand(game).length;
    cast(game, tide, { targets: [null, null] });
    expect(hand(game).length).toBe(mine - 1 + 2 - 1);
  });
});

describe("Psychic Whorl", () => {
  it("target opponent discards two; without a Rat there's no surveil", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    let surveils = 0;
    a.chooseScryFn = () => {
      surveils += 1;
      return [];
    };
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Psychic Whorl"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(theirs - 2);
    expect(surveils).toBe(0);
  });

  it("then, with a Rat, surveils 2", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Thought Shucker");
    let seen: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      seen = cards;
      return [];
    };
    cast(game, toHand(game, "Psychic Whorl"), { targets: [ref(B)] });
    expect(seen.length).toBe(2);
  });
});

describe("Thought Shucker", () => {
  it("can't be activated without threshold", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const shucker = spawn(game, "Thought Shucker");
    expect(() => activate(game, shucker, 0)).toThrow();
  });

  it("with seven cards in the graveyard: a +1/+1 counter and a card, and only once", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const shucker = spawn(game, "Thought Shucker");
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    const mine = hand(game).length;
    activate(game, shucker, 0);
    expect(counters(game, shucker)).toBe(1);
    expect(hand(game).length).toBe(mine + 1);
    // Only once — not once each turn.
    expect(() => activate(game, shucker, 0)).toThrow();
    nextTurn(game);
    nextTurn(game);
    expect(() => activate(game, shucker, 0)).toThrow();
  });
});

describe("Wildfire Howl", () => {
  it("unpromised: 2 damage to each creature, no target and no gift", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Wildfire Howl"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[mine].damageMarked).toBe(2);
    expect(hand(game, B).length).toBe(theirs);
    expect(life(game, B)).toBe(20);
  });

  it("promised: the opponent draws, then 1 to any target and 2 to each creature", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B);
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Wildfire Howl"), { kicked: true, targets: [ref(B)] });
    expect(hand(game, B).length).toBe(theirs + 1);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("promised and aimed at a creature, its 3 damage is one event (one enrage trigger)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const raptor = spawn(game, "Ripjaw Raptor", B);
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Wildfire Howl"), { kicked: true, targets: [ref(raptor)] });
    expect(game.state.objects[raptor].damageMarked).toBe(3);
    // The gift's card and one enrage draw — not two.
    expect(hand(game, B).length).toBe(theirs + 2);
  });
});

describe("Tangle Tumbler", () => {
  it("tapping two untapped tokens, summoning sick ones too, makes it an artifact creature until end of turn", () => {
    const { game } = table();
    const tumbler = spawn(game, "Tangle Tumbler");
    makeTokens(game, "Soldier Token", 1);
    expect(() => activate(game, tumbler, 1)).toThrow();
    makeTokens(game, "Food Token", 1);
    activate(game, tumbler, 1);
    expect(types(game, tumbler)).toContain("creature");
    expect(pt(game, tumbler)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, tumbler).has("vigilance")).toBe(true);
    const tokens = game.battlefield.filter((id) => game.state.objects[id].isToken);
    expect(tokens.every((id) => isTapped(game, id))).toBe(true);
    nextTurn(game);
    expect(types(game, tumbler)).not.toContain("creature");
  });

  it("{3}, {T}: a +1/+1 counter on target creature", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const tumbler = spawn(game, "Tangle Tumbler");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    activate(game, tumbler, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(isTapped(game, tumbler)).toBe(true);
  });
});

describe("Pileated Provisioner", () => {
  it("puts a +1/+1 counter on a creature you control without flying", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Serra Angel");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [giant]);
    const bird = enter(game, "Pileated Provisioner");
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(counters(game, giant)).toBe(1);
    expect(counters(game, bird)).toBe(0);
  });
});

describe("Finch Formation", () => {
  it("its enters trigger gives a creature you control flying until end of turn", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Finch Formation"));
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("offspring {3}: a 1/1 token copy, whose own enters trigger fires too", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(bears)];
    };
    cast(game, toHand(game, "Finch Formation"), { kicked: true });
    expect(tokensNamed(game, "Finch Formation")).toBe(1);
    const token = named(game, "Finch Formation").find((id) => game.state.objects[id].isToken);
    expect(token).toBeDefined();
    expect(pt(game, token!)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, token!).has("flying")).toBe(true);
    expect(asked).toBe(2);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Downwind Ambusher", () => {
  it("mode one: target creature an opponent controls gets -1/-1", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    cast(game, toHand(game, "Downwind Ambusher"));
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });

  it("mode two: destroys an opponent's creature that was dealt damage this turn, and only such a one", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, wurm);
    cast(game, toHand(game, "Shock"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    pickModes(a, 1);
    const seen = watchTargets(a, () => [wurm]);
    cast(game, toHand(game, "Downwind Ambusher"));
    // The undamaged Hill Giant isn't a legal target, so the Wurm, the one
    // option, is chosen without asking.
    expect(seen.asked).toBe(0);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Seedpod Squire", () => {
  it("attacking, gives a creature you control without flying +1/+1 until end of turn", () => {
    const { game, a } = table();
    const squire = spawn(game, "Seedpod Squire");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    attack(game, a, [squire]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, squire)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Driftgloom Coyote", () => {
  it("exiles an opponent's creature until it leaves, with a +1/+1 counter for a power-2 one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const coyote = enter(game, "Driftgloom Coyote");
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, coyote)).toBe(1);
    destroy(game, coyote);
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });

  it("no counter for a power-3 creature", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const coyote = enter(game, "Driftgloom Coyote");
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, coyote)).toBe(0);
  });

  it("reads the power the creature had on the battlefield, effects included", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" }, [
      ref(giant),
    ]);
    const coyote = enter(game, "Driftgloom Coyote");
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, coyote)).toBe(1);
  });
});

describe("Moonstone Eulogist", () => {
  it("a creature an opponent controls dying makes you a Blood token; yours doesn't", () => {
    const { game } = table();
    spawn(game, "Moonstone Eulogist");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    destroy(game, mine);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    destroy(game, theirs);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
    expect(tokensNamed(game, "Blood Token", B)).toBe(0);
  });

  it("dying alongside an opponent's creature still makes the Blood (the ruling)", () => {
    const { game } = table();
    const bat = spawn(game, "Moonstone Eulogist");
    spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } });
    settle(game);
    expect(zone(game, bat)).toBe("graveyard");
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });

  it("sacrificing an artifact puts a +1/+1 counter on it and gains you 1 life", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const bat = spawn(game, "Moonstone Eulogist");
    makeTokens(game, "Food Token", 1);
    const food = game.battlefield.find((id) => game.state.objects[id].cardName === "Food Token")!;
    activate(game, food, 0);
    // The Food's 3, and the Eulogist's 1.
    expect(life(game)).toBe(24);
    expect(counters(game, bat)).toBe(1);
  });
});

describe("Velukan Dragon", () => {
  it("attacking, rolls a d6 and gets +X/+0, X the result minus 1", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Velukan Dragon");
    attack(game, a, [dragon]);
    const roll = lastRoll(game);
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(6);
    expect(game.state.lastRoll?.sides).toBe(6);
    expect(pt(game, dragon)).toEqual({ power: 5 + roll - 1, toughness: 5 });
    expect(life(game, B)).toBe(20 - (5 + roll - 1));
  });

  it("blocking, rolls too", () => {
    const { game, a, b } = table();
    const dragon = spawn(game, "Velukan Dragon");
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: dragon, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(game.state.lastRoll?.player).toBe(A);
    expect(pt(game, dragon)).toEqual({ power: 5 + lastRoll(game) - 1, toughness: 5 });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Surtr, Fiery Jötun", () => {
  it("casting a historic spell deals 3 damage to any target; a nonhistoric one doesn't", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Surtr, Fiery Jötun");
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    cast(game, toHand(game, "Sol Ring"));
    expect(life(game, B)).toBe(15);
  });
});

describe("Lydia Frye", () => {
  it("at your end step, surveils X, X the tapped Assassins you control", () => {
    const { game, a } = table();
    spawn(game, "Lydia Frye", A, { tapped: true });
    spawn(game, "Iridescent Vinelasher", A, { tapped: true });
    spawn(game, "Iridescent Vinelasher");
    spawn(game, "Iridescent Vinelasher", B, { tapped: true });
    toLibrary(game, "Wastes");
    let seen: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      seen = cards;
      return [];
    };
    toStep(game, "end");
    settle(game);
    expect(seen.length).toBe(2);
  });
});
