/**
 * The set walk, batch 55, part b (2026-10-11): Marvel Super Heroes Commander.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

/** Who may attack, as the attack is declared. */
const eligibleAttackers = (game: Game): readonly ObjectId[] => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
  return offer?.kind === "declare-attackers" ? offer.eligible : [];
};

/** The seat casts the first offered card in `wanted` (each once), free and
 * with no targets, recording what it was offered and what it could cast. */
function castFromOffers(
  seat: ScriptedController,
  wanted: readonly ObjectId[],
): { offered: (readonly ObjectId[])[]; castable: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[], castable: [] as (readonly ObjectId[])[] };
  const left = [...wanted];
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    seen.castable.push(offer.casts.map((c) => c.card));
    const pick = left.find((id) => offer.casts.some((c) => c.card === id));
    if (pick === undefined) return null;
    left.splice(left.indexOf(pick), 1);
    const way = offer.casts.find((c) => c.card === pick)!;
    return { type: "cast-spell", player: seat.playerId, card: pick, targets: [], via: way.via, free: true };
  };
  return seen;
}

describe("Scarlet Witch, Chaotic Avenger", () => {
  it("exiles the top two face down, then may cast a Hero or noncreature spell from among every card exiled with her", () => {
    const { game, a } = table();
    const witch = spawn(game, "Scarlet Witch, Chaotic Avenger");
    const divination = toLibrary(game, "Divination");
    const bears = toLibrary(game, "Grizzly Bears");
    // First hit: decline.
    const first = castFromOffers(a, []);
    attack(game, a, [witch]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, divination)).toBe("exile");
    expect(game.state.objects[divination].exiledFaceDown).toBeDefined();
    expect(first.castable).toEqual([[divination]]);

    // Next turn (after alice's draw), the second hit's two Wastes join them —
    // and Divination, exiled by the first trigger, is still on offer.
    toStep(game, "precombat-main");
    const wastesA = toLibrary(game, "Wastes");
    const wastesB = toLibrary(game, "Wastes");
    const second = castFromOffers(a, [divination]);
    const handBefore = hand(game).length;
    attack(game, a, [witch]);
    expect(zone(game, wastesA)).toBe("exile");
    expect(zone(game, wastesB)).toBe("exile");
    expect(second.castable[0]).toEqual([divination]);
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(handBefore + 2);
    expect(zone(game, bears)).toBe("exile");
  });

  it("offers a Hero creature card", () => {
    const { game, a } = table();
    const witch = spawn(game, "Scarlet Witch, Chaotic Avenger");
    toLibrary(game, "Wastes");
    const wasp = toLibrary(game, "The Wasp, Winsome Avenger");
    const seen = castFromOffers(a, []);
    attack(game, a, [witch]);
    expect(seen.castable).toEqual([[wasp]]);
  });
});

describe("Captain America, Team Leader", () => {
  it("gives another Hero vigilance and haste and a counter, and puts a counter on itself", () => {
    const { game } = table();
    const cap = spawn(game, "Captain America, Team Leader");
    enter(game, "Grizzly Bears");
    expect(counters(game, cap)).toBe(0);
    const council = enter(game, "Council of Reeds");
    expect(counters(game, council)).toBe(1);
    expect(counters(game, cap)).toBe(1);
    expect(keywords(game, council).has("vigilance")).toBe(true);
    expect(keywords(game, council).has("haste")).toBe(true);
  });
});

describe("Bast, Panther Goddess", () => {
  it("pumps the target attacker by the number of creatures you control as it resolves", () => {
    const { game, a } = table();
    spawn(game, "Bast, Panther Goddess");
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bear]);
    a.declareAttackersFn = () => [
      { attacker: bear, defender: B },
      { attacker: other, defender: B },
    ];
    toStep(game, "declare-blockers");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bear, other]));
    // Bast and the two Bears.
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
  });

  it("can attack only while you control three or more creatures, itself included", () => {
    const { game } = table();
    const bast = spawn(game, "Bast, Panther Goddess");
    spawn(game, "Grizzly Bears");
    expect(eligibleAttackers(game)).not.toContain(bast);
    const again = table();
    const bast2 = spawn(again.game, "Bast, Panther Goddess");
    spawn(again.game, "Grizzly Bears");
    spawn(again.game, "Grizzly Bears");
    expect(eligibleAttackers(again.game)).toContain(bast2);
  });
});

describe("Council of Reeds", () => {
  it("copies itself at the beginning of combat after a noncreature spell, and the copies don't die to the legend rule", () => {
    const { game } = table();
    spawn(game, "Council of Reeds");
    toStep(game, "begin-combat");
    settle(game);
    expect(named(game, "Council of Reeds")).toHaveLength(1);

    toStep(game, "precombat-main");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    toStep(game, "begin-combat");
    settle(game);
    const councils = named(game, "Council of Reeds");
    expect(councils).toHaveLength(2);
    expect(councils.filter((id) => game.state.objects[id].isToken === true)).toHaveLength(1);
  });
});

describe("Red Ghost, Intangible Genius", () => {
  it("makes a hasty 3/3 Ape Villain on your second card drawn each turn", () => {
    const { game } = table();
    spawn(game, "Red Ghost, Intangible Genius");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(tokensNamed(game, "Ape Villain Token", A)).toBe(1);
    const ape = named(game, "Ape Villain Token")[0];
    expect(pt(game, ape)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, ape).has("haste")).toBe(true);
  });
});

describe("The Frightful Four", () => {
  it("makes an opponent lose life equal to their first noncreature spell's mana value, once a turn", () => {
    const { game } = table();
    spawn(game, "The Frightful Four");
    nextTurn(game);
    lands(game, "Island", 6, B);
    cast(game, toHand(game, "Divination", B), { player: B });
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Divination", B), { player: B });
    expect(life(game, B)).toBe(17);
  });
});

describe("Royal Talon Fighter Jet", () => {
  it("enters with X counters and makes that many Soldiers", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Royal Talon Fighter Jet"), { x: 3 });
    const jet = named(game, "Royal Talon Fighter Jet")[0];
    expect(counters(game, jet)).toBe(3);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);
  });
});

describe("Ultron, Machine Overlord", () => {
  it("gives your other Robots and Constructs +2/+2", () => {
    const { game } = table();
    const ultron = spawn(game, "Ultron, Machine Overlord");
    const robot = spawn(game, "Robot Token");
    const construct = spawn(game, "Construct Token (Ancient Stone Idol)");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Robot Token", B);
    expect(pt(game, ultron)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, robot).power).toBe(pt(game, theirs).power + 2);
    expect(pt(game, construct)).toEqual({ power: 8, toughness: 14 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Cosmic Crucible", () => {
  it("copies only once a turn, and a declined copy doesn't use it up", () => {
    const { game, a } = table();
    spawn(game, "Cosmic Crucible");
    lands(game, "Island", 9);
    let asked = 0;
    const answers = [false, true];
    a.chooseModesFn = () => {
      asked += 1;
      return answers.shift() === true ? [0] : [];
    };
    const start = hand(game).length;
    cast(game, toHand(game, "Divination"));
    expect(hand(game).length).toBe(start + 2);
    cast(game, toHand(game, "Divination"));
    expect(hand(game).length).toBe(start + 6);
    cast(game, toHand(game, "Divination"));
    expect(hand(game).length).toBe(start + 8);
    expect(asked).toBe(2);
  });

  it("adds four mana as your first main phase begins", () => {
    const { game } = table();
    spawn(game, "Cosmic Crucible");
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.players[A].manaPool).toHaveLength(4);
  });
});

describe("The Wasp, Winsome Avenger", () => {
  it("offers any Hero for hexproof", () => {
    const { game, a } = table();
    const council = spawn(game, "Council of Reeds", B);
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, (offered) => [offered[0][0] ?? null]);
    const wasp = enter(game, "The Wasp, Winsome Avenger");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([council, wasp]));
    expect(seen.offered[0]).not.toContain(bears);
  });
});

describe("Kingpin, Wilson Fisk", () => {
  it("makes two Treasures when you sacrifice Kingpin itself, only once a turn", () => {
    const { game } = table();
    const altar = spawn(game, "Ashnod's Altar");
    const kingpin = spawn(game, "Kingpin, Wilson Fisk");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: 0, targets: [], sacrifice: kingpin });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("makes two Treasures when you sacrifice another creature", () => {
    const { game } = table();
    const altar = spawn(game, "Ashnod's Altar");
    spawn(game, "Kingpin, Wilson Fisk");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });
});

describe("West Coast Expansion", () => {
  it("offers a free Hero spell from hand only when X is 5 or more", () => {
    const { game, a } = table();
    lands(game, "Island", 13);
    const wasp = toHand(game, "The Wasp, Winsome Avenger");
    toHand(game, "Grizzly Bears");
    const small = castFromOffers(a, []);
    cast(game, toHand(game, "West Coast Expansion"), { x: 4 });
    expect(small.offered).toHaveLength(0);

    pickModes(a);
    const big = castFromOffers(a, [wasp]);
    const before = hand(game).length;
    cast(game, toHand(game, "West Coast Expansion"), { x: 5 });
    expect(big.castable[0]).toEqual([wasp]);
    expect(zone(game, wasp)).toBe("battlefield");
    // The spell put in hand and cast, five drawn, the Wasp cast from hand.
    expect(hand(game).length).toBe(before + 4);
  });
});
