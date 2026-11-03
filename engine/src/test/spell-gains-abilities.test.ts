/**
 * A spell gaining an ability while it's on the stack, carried onto the
 * permanent it becomes (rule 400.7a): keywords and triggered abilities from a
 * cast trigger, rebound read as the spell resolves (702.88a), bloodthirst
 * asked as it enters (702.54), riot from a static or from the mana that paid
 * for it, each instance asked apart (614.12, 702.136b).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** The seat answers each riot it's asked with these, in order, and counts them. */
function answerRiot(seat: ScriptedController, ...picks: readonly ("counter" | "haste")[]): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseCreatureTypeFn = (_view, _source, options) => {
    const pick = picks[seen.asked] ?? "counter";
    seen.asked += 1;
    return options.find((option) => option.toLowerCase().includes(pick)) ?? options[0];
  };
  return seen;
}

const castOffers = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

describe("rebound gained or given", () => {
  it("Taigam: a spell from hand after he attacked gains rebound, and comes back at the next upkeep", () => {
    const { game, a } = table();
    const taigam = spawn(game, "Taigam, Ojutai Master", A);
    lands(game, "Island", 3);
    attack(game, a, [taigam]);
    const draw = toHand(game, "Divination");
    cast(game, draw);
    expect(zone(game, draw)).toBe("exile");
    pickModes(a, 0);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0]!;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, free: true };
    };
    // Bob's turn, then alice's upkeep and the free cast.
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, draw)).toBe("graveyard");
  });

  it("Taigam: not before he attacked", () => {
    const { game } = table();
    spawn(game, "Taigam, Ojutai Master", A);
    lands(game, "Island", 3);
    const draw = toHand(game, "Divination");
    cast(game, draw);
    expect(zone(game, draw)).toBe("graveyard");
  });

  it("Taigam: not from anywhere but the hand", () => {
    const { game, a } = table();
    const taigam = spawn(game, "Taigam, Ojutai Master", A);
    lands(game, "Island", 3);
    attack(game, a, [taigam]);
    const twice = toGraveyard(game, "Think Twice");
    cast(game, twice, { via: "flashback" });
    expect(zone(game, twice)).toBe("exile");
    // Flashback's exile: nothing brings it back.
    let offered = 0;
    a.chooseCastNowFn = () => {
      offered += 1;
      return null;
    };
    nextTurn(game);
    nextTurn(game);
    expect(offered).toBe(0);
  });

  it("Cast Through Time: instants and sorceries from hand rebound; creatures don't", () => {
    const { game } = table();
    spawn(game, "Cast Through Time", A);
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    const draw = toHand(game, "Divination");
    cast(game, draw);
    expect(zone(game, draw)).toBe("exile");
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Cast Through Time gone before the spell resolves gives it no rebound", () => {
    const { game } = table();
    const time = spawn(game, "Cast Through Time", A);
    lands(game, "Island", 3);
    const draw = toHand(game, "Divination");
    cast(game, draw, { settle: false });
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(time)]);
    settle(game);
    expect(zone(game, draw)).toBe("graveyard");
  });
});

describe("bloodthirst gained", () => {
  it("Bloodlord: a Vampire spell enters with three more only if an opponent was dealt damage, asked as it enters", () => {
    const { game } = table();
    spawn(game, "Bloodlord of Vaasgoth", A);
    lands(game, "Swamp", 2);
    const vampire = toHand(game, "Vampire Interloper");
    cast(game, vampire, { settle: false });
    // The trigger has resolved, and only then is the opponent dealt damage.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(zone(game, vampire)).toBe("stack");
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    expect(counters(game, vampire)).toBe(3);
  });

  it("no damage, no counters", () => {
    const { game } = table();
    spawn(game, "Bloodlord of Vaasgoth", A);
    lands(game, "Swamp", 2);
    const vampire = toHand(game, "Vampire Interloper");
    cast(game, vampire);
    expect(counters(game, vampire)).toBe(0);
  });

  it("a Vampire with bloodthirst of its own has both, each applying apart (702.54c)", () => {
    const { game, a } = table();
    spawn(game, "Bloodlord of Vaasgoth", A);
    const attacker = spawn(game, "Raging Goblin", A);
    lands(game, "Swamp", 5);
    attack(game, a, [attacker]);
    const second = toHand(game, "Bloodlord of Vaasgoth");
    cast(game, second);
    // Its own 3 and the first Bloodlord's 3.
    expect(counters(game, second)).toBe(6);
    expect(life(game, B)).toBe(19);
  });
});

describe("riot from a static, as it enters", () => {
  it("Rhythm of the Wild asks, and the counter or haste goes on", () => {
    const { game, a } = table();
    spawn(game, "Rhythm of the Wild", A);
    lands(game, "Forest", 4);
    const seen = answerRiot(a, "counter", "haste");
    const one = toHand(game, "Grizzly Bears");
    cast(game, one);
    expect(seen.asked).toBe(1);
    expect(counters(game, one)).toBe(1);
    expect(keywords(game, one).has("haste")).toBe(false);
    const two = toHand(game, "Grizzly Bears");
    cast(game, two);
    expect(seen.asked).toBe(2);
    expect(counters(game, two)).toBe(0);
    expect(keywords(game, two).has("haste")).toBe(true);
  });

  it("each instance is asked apart: printed riot under it, two counters or both", () => {
    const { game, a } = table();
    spawn(game, "Rhythm of the Wild", A);
    lands(game, "Mountain", 3);
    const seen = answerRiot(a, "counter", "haste");
    const riot = toHand(game, "Burning-Tree Vandal");
    cast(game, riot);
    expect(seen.asked).toBe(2);
    expect(counters(game, riot)).toBe(1);
    expect(keywords(game, riot).has("haste")).toBe(true);
  });

  it("an opponent's creature isn't asked; a token gets none from a nontoken grant", () => {
    const { game, a, b } = table();
    spawn(game, "Rhythm of the Wild", A);
    const asked = answerRiot(a);
    const theirs = answerRiot(b);
    // Bob's creature, put there by Bob.
    const bear = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "put-onto-battlefield", target: 0 }, [ref(bear)]);
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
    expect(asked.asked).toBe(0);
    expect(theirs.asked).toBe(0);
    game.debugApplyEffect(A, { kind: "create-token", token: "Beast Token (Red-Green)", count: 1 });
    settle(game);
    const [token] = named(game, "Beast Token (Red-Green)", A);
    expect(keywords(game, token).has("haste")).toBe(false);
    expect(asked.asked).toBe(0);
  });

  it("put onto the battlefield under you from another's graveyard: read as it will be, under you", () => {
    const { game, a, b } = table();
    spawn(game, "Rhythm of the Wild", A);
    const asked = answerRiot(a, "counter");
    const theirs = answerRiot(b);
    const wurm = toGraveyard(game, "Craw Wurm", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Reanimate"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(asked.asked).toBe(1);
    expect(theirs.asked).toBe(0);
    expect(counters(game, wurm)).toBe(1);
  });

  it("creature spells can't be countered, under Rhythm", () => {
    const { game } = table();
    spawn(game, "Rhythm of the Wild", A);
    lands(game, "Forest", 2);
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(bear)]);
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Uncivil Unrest doubles the damage of what has a +1/+1 counter, and only that", () => {
    const { game, a } = table();
    spawn(game, "Uncivil Unrest", A);
    lands(game, "Forest", 4);
    answerRiot(a, "counter", "haste");
    const countered = toHand(game, "Grizzly Bears");
    cast(game, countered);
    const hasty = toHand(game, "Grizzly Bears");
    cast(game, hasty);
    attack(game, a, [hasty]);
    // Bears with haste: 2, not doubled.
    expect(life(game, B)).toBe(18);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [countered]);
    // Bears with the counter: 3, doubled.
    expect(life(game, B)).toBe(12);
  });
});

describe("riot from the mana that paid", () => {
  it("Domri's +1 spent on a creature spell gives it riot; it's asked as it enters, and has no end", () => {
    const { game, a } = table();
    const domri = spawn(game, "Domri, Chaos Bringer", A);
    lands(game, "Forest", 1);
    pickModes(a, 0);
    const seen = answerRiot(a, "counter");
    loyalty(game, domri, 1);
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
    expect(seen.asked).toBe(1);
    expect(counters(game, bear)).toBe(1);
    nextTurn(game);
    expect(keywords(game, bear).has("riot")).toBe(true);
  });

  it("spent on anything else, nothing", () => {
    const { game, a } = table();
    const domri = spawn(game, "Domri, Chaos Bringer", A);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    const seen = answerRiot(a);
    loyalty(game, domri, 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(seen.asked).toBe(0);
    expect(life(game, B)).toBe(18);
  });

  it("Domri's -8 makes a Beast at each end step", () => {
    const { game } = table();
    const domri = spawn(game, "Domri, Chaos Bringer", A);
    loyalty(game, domri, -8, { atLeast: 8 });
    nextTurn(game);
    expect(tokensNamed(game, "Beast Token (Red-Green)", A)).toBe(1);
  });
});

describe("a triggered ability gained as a spell", () => {
  it("Rivaz: a Dragon cast from the graveyard keeps \"when this creature dies, exile it\" on the battlefield", () => {
    const { game } = table();
    spawn(game, "Rivaz of the Claw", A);
    lands(game, "Mountain", 6);
    const dragon = toGraveyard(game, "Shivan Dragon");
    cast(game, dragon, { via: "graveyard-permission" });
    expect(zone(game, dragon)).toBe("battlefield");
    destroy(game, dragon);
    settle(game);
    expect(zone(game, dragon)).toBe("exile");
  });

  it("Rivaz: a Dragon cast from hand doesn't", () => {
    const { game } = table();
    spawn(game, "Rivaz of the Claw", A);
    lands(game, "Mountain", 6);
    const dragon = toHand(game, "Shivan Dragon");
    cast(game, dragon);
    destroy(game, dragon);
    settle(game);
    expect(zone(game, dragon)).toBe("graveyard");
  });

  it("Rivaz: once a turn, and its mana pays only for Dragons", () => {
    const { game } = table();
    const rivaz = spawn(game, "Rivaz of the Claw", A);
    lands(game, "Mountain", 12);
    const first = toGraveyard(game, "Shivan Dragon");
    const second = toGraveyard(game, "Shivan Dragon");
    expect(castOffers(game, first).length).toBeGreaterThan(0);
    cast(game, first, { via: "graveyard-permission" });
    expect(castOffers(game, second)).toEqual([]);
    expect(zone(game, rivaz)).toBe("battlefield");
  });

  it("Thief of Existence: exiling something, it gains the leave trigger; the opponent draws when it leaves", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    lands(game, "Forest", 2);
    const thief = toHand(game, "Thief of Existence");
    const orb = spawn(game, "Mind Stone", B);
    pickTargets(a, orb);
    cast(game, thief);
    expect(zone(game, orb)).toBe("exile");
    expect(zone(game, thief)).toBe("battlefield");
    const before = hand(game, B).length;
    pickTargets(a, B);
    destroy(game, thief);
    settle(game);
    expect(hand(game, B)).toHaveLength(before + 1);
  });

  it("Thief of Existence: exiling nothing, it doesn't", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    lands(game, "Forest", 2);
    const thief = toHand(game, "Thief of Existence");
    a.chooseTargetsFn = () => [];
    cast(game, thief);
    expect(zone(game, thief)).toBe("battlefield");
    const before = hand(game, B).length;
    destroy(game, thief);
    settle(game);
    expect(hand(game, B)).toHaveLength(before);
    expect(graveyard(game)).toContain(thief);
  });

  it("Thief of Existence can't reach what's too big, or what's a creature", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    lands(game, "Forest", 2);
    const thief = toHand(game, "Thief of Existence");
    const big = spawn(game, "Darksteel Forge", B);
    const creature = spawn(game, "Grizzly Bears", B);
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered = legal.flat();
      return [];
    };
    cast(game, thief);
    expect(offered).not.toContainEqual(ref(big));
    expect(offered).not.toContainEqual(ref(creature));
    expect(named(game, "Darksteel Forge")).toHaveLength(1);
  });
});
