/**
 * Engine rules gaps closed 2026-10-25 (`docs/engine-gaps.md`), each with the
 * card that shows it. Written from the Comprehensive Rules and the cards'
 * rulings, on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { fitsTogether } from "../zone-choice-together.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
  controller,
  counters,
  pt,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  registryOf,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Advance to the first combat damage step with something on the stack, and
 * say how many abilities are there. */
function damageTriggers(game: Game): number {
  game.advanceUntil((s) => s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0);
  return game.state.zones.shared.stack.length;
}

describe("a granted ability's dynamic target filter reads the creature that has it", () => {
  it("Firja's Retribution: an Angel destroys only a creature with less power than its own", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 1);
    const saga = toHand(game, "Firja's Retribution");
    cast(game, saga);
    expect(tokensNamed(game, "Angel Warrior Token (Flying, Vigilance)")).toBe(1);
    const angel = spawn(game, "Serra Angel");
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    // Serra Angel is 4/4: Craw Wurm's 6 power isn't less than this
    // creature's power, though the Saga has none at all.
    expect(() => activate(game, angel, 0, { targets: [ref(wurm)] })).toThrow();
    activate(game, angel, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    void A;
  });
});

describe("\"whenever this deals damage\" triggers once per damage event", () => {
  it("Armadillo Cloak: a trampler blocked deals damage to the blocker and the player at once — one trigger, the total", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Armadillo Cloak"), { targets: [ref(bears)] });
    // 4/4 trample, blocked by a 2/2: 2 to the blocker, 2 to bob.
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    expect(damageTriggers(game)).toBe(1);
    settle(game);
    expect(life(game, A)).toBe(24);
    expect(life(game, B)).toBe(18);
  });

  it("Ceremonial Knife: the granted \"deals combat damage\" trigger — a trampler's blocker and player are one event", () => {
    const { game, a, b } = table();
    const maw = spawn(game, "Colossal Dreadmaw");
    const blocker = spawn(game, "Grizzly Bears", B);
    const knife = spawn(game, "Ceremonial Knife");
    lands(game, "Plains", 2);
    activate(game, knife, 0, { targets: [ref(maw)] });
    a.declareAttackersFn = () => [{ attacker: maw, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker: maw }];
    expect(damageTriggers(game)).toBe(1);
    settle(game);
    expect(tokensNamed(game, "Blood Token")).toBe(1);
    expect(life(game, B)).toBe(15);
  });

  it("Towering-Wave Mystic: target player mills as many cards as the damage it dealt", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Towering-Wave Mystic");
    pickTargets(a, B);
    attack(game, a, [mystic]);
    expect(graveyard(game, B).length).toBe(2);
  });
});

describe("a merged permanent is a token only if its topmost component is (rule 730.2d)", () => {
  const isToken = (game: Game, id: ObjectId): boolean =>
    matchesFilter(game.state, registryOf(game), id, { token: true }, { you: A });

  it("a card mutated on top of a token is no token; a token under a card stays one", () => {
    const { game, a } = table();
    const top = spawn(game, "Bear Token");
    const under = spawn(game, "Wolf Token");
    // `spawn` puts a token's card on the battlefield; these are tokens.
    game.state.objects[top].isToken = true;
    game.state.objects[under].isToken = true;
    lands(game, "Forest", 8);
    pickModes(a, 0);
    cast(game, toHand(game, "Glowstone Recluse"), { overload: true, targets: [ref(top)] });
    pickModes(a, 1);
    cast(game, toHand(game, "Glowstone Recluse"), { overload: true, targets: [ref(under)] });
    expect(isToken(game, top)).toBe(false);
    expect(isToken(game, under)).toBe(true);
    expect(game.viewFor(A).objects[top]?.isToken).toBe(false);
  });
});

describe("a conditional grant's leaves-the-battlefield ability looks back in time (rule 603.10a)", () => {
  it("Relic Vial: its only Cleric dying still triggers the granted dies ability", () => {
    const { game } = table();
    spawn(game, "Relic Vial");
    const cleric = spawn(game, "Abbey Matron");
    destroy(game, cleric);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(19);
    // No Cleric now: another creature dying triggers nothing.
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(21);
  });

  it("Relic Vial: sacrificing the only Cleric to its own ability triggers it (the ruling)", () => {
    const { game } = table();
    const vial = spawn(game, "Relic Vial");
    const cleric = spawn(game, "Abbey Matron");
    lands(game, "Plains", 2);
    game.dispatch({ type: "activate-ability", player: A, source: vial, abilityIndex: 0, targets: [], sacrifice: cleric });
    settle(game);
    expect(zone(game, cleric)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });
});

describe("\"until end of turn, whenever …\" is a delayed trigger (rule 603.7c)", () => {
  it("Dovin, Grand Arbiter: +1 then two creatures connect — two loyalty counters", () => {
    const { game, a } = table();
    const dovin = spawn(game, "Dovin, Grand Arbiter");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    loyalty(game, dovin, 1);
    expect(counters(game, dovin, "loyalty")).toBe(4);
    attack(game, a, [bears, lions]);
    expect(counters(game, dovin, "loyalty")).toBe(6);
    expect(life(game, B)).toBe(16);
    // It lapses with the turn.
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [bears]);
    expect(counters(game, dovin, "loyalty")).toBe(6);
  });

  it("Mountain Titan: a counter for each black spell cast this turn, and none for another colour", () => {
    const { game } = table();
    const titan = spawn(game, "Mountain Titan");
    lands(game, "Mountain", 3);
    activate(game, titan, 0);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Dark Ritual"));
    expect(counters(game, titan)).toBe(1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, titan)).toBe(1);
  });

  it("Battle Cry: each creature that blocks this turn gets +0/+1", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Battle Cry"));
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("a graveyard choice with a set rule: total mana value N or less", () => {
  it("Lively Dirge: up to two creature cards whose mana values add up to 4 or less", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    lands(game, "Swamp", 4);
    const seen = pickFromZone(a, bears, lions);
    cast(game, toHand(game, "Lively Dirge"), { modes: [1] });
    expect(seen.offered).toEqual(expect.arrayContaining([giant, bears, lions]));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, lions)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Lively Dirge: two cards over the total aren't a legal answer", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    let fits: ((chosen: readonly ObjectId[]) => boolean) | undefined;
    a.chooseFromZoneFn = () => {
      const awaiting = game.state.awaiting;
      const together = awaiting?.kind === "choose-from-zone" ? awaiting.together : undefined;
      if (together !== undefined) fits = (chosen) => fitsTogether(together, chosen);
      return [giant];
    };
    cast(game, toHand(game, "Lively Dirge"), { modes: [1] });
    // Both together are 6.
    expect(fits?.([giant, bears])).toBe(false);
    expect(fits?.([giant])).toBe(true);
    expect(fits?.([])).toBe(true);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("\"whenever a creature you control deals combat damage to that player this turn\"", () => {
  it("Great Train Heist: a tapped Treasure for each creature that connects with the chosen opponent, none for another", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Great Train Heist"), { modes: [2], targets: [ref(B)] });
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: lions, defender: B },
      { attacker: giant, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Treasure Token")).toBe(2);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Treasure Token").every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("\"each player may\": everyone chooses, then it all happens (rule 101.4)", () => {
  it("Will of the Jeskai: bob chooses before alice's hand is discarded, then both wheel", () => {
    const { game, a, b } = table();
    const kept = toHand(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const spell = toHand(game, "Will of the Jeskai");
    pickModes(a, 0);
    let aliceHandWhenBobChose: readonly string[] | undefined;
    b.chooseModesFn = () => {
      aliceHandWhenBobChose = [...hand(game, A)];
      return [0];
    };
    cast(game, spell, { modes: [0] });
    expect(aliceHandWhenBobChose).toContain(kept);
    expect(zone(game, kept)).toBe("graveyard");
    expect(hand(game, A)).toHaveLength(5);
    expect(hand(game, B)).toHaveLength(5);
  });

  it("Kwain, Itinerant Meddler: whoever drew gains 1 life; who declined neither draws nor gains", () => {
    const { game, a, b } = table();
    const kwain = spawn(game, "Kwain, Itinerant Meddler");
    pickModes(a, 0);
    b.chooseModesFn = () => [];
    const before = { a: hand(game, A).length, b: hand(game, B).length };
    activate(game, kwain, 0);
    expect(hand(game, A)).toHaveLength(before.a + 1);
    expect(hand(game, B)).toHaveLength(before.b);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(20);
  });

  it("Snort: both wheel, and only the opponent who did is dealt 5", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 4);
    pickModes(a, 0);
    pickModes(b, 0);
    cast(game, toHand(game, "Snort"));
    expect(hand(game, A)).toHaveLength(5);
    expect(hand(game, B)).toHaveLength(5);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(15);
  });
});

describe("an X total divided among targets", () => {
  it("Fire Covenant: X life paid, X damage divided as chosen", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Fire Covenant"), { x: 5, targets: [ref(bears), ref(giant)], division: [2, 3] });
    expect(life(game, A)).toBe(15);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Fire Covenant: no more targets than X", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Fire Covenant"), { x: 1, targets: [ref(bears), ref(giant)] })).toThrow();
  });
});

describe("Phyrexian mana paid with life by choice (rule 107.4f)", () => {
  it("Dismember: both Phyrexian pips paid with life keep two Swamps untapped", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const swamps = lands(game, "Swamp", 3);
    const card = toHand(game, "Dismember");
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card);
    expect(offer?.kind === "cast-spell" && offer.phyrexianPips).toBe(2);
    cast(game, card, { targets: [ref(giant)], phyrexianLife: 2 });
    expect(life(game, A)).toBe(16);
    expect(swamps.filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Dismember: without the choice, mana pays what it can", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Dismember"), { targets: [ref(giant)] });
    expect(life(game, A)).toBe(20);
  });

  it("Ajani, Sleeper Agent: compleated, cast with life by choice, enters with two fewer loyalty", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Plains", 2);
    const ajani = toHand(game, "Ajani, Sleeper Agent");
    cast(game, ajani, { phyrexianLife: 1 });
    expect(life(game, A)).toBe(18);
    expect(counters(game, ajani, "loyalty")).toBe(2);
  });
});

describe("a source of damage may be one only an ability on the stack still refers to (rule 609.7a)", () => {
  it("Circle of Protection: Red stops a dead creature's dies trigger", () => {
    const { game, a, b } = table();
    const circle = spawn(game, "Circle of Protection: Red");
    const torch = spawn(game, "Mudbutton Torchrunner", B);
    lands(game, "Plains", 1);
    pickTargets(b, A);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(torch)]);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    expect(zone(game, torch)).toBe("graveyard");
    const seen = pickPermanents(a, torch);
    activate(game, circle, 0);
    expect(seen.offered).toContain(torch);
    expect(life(game, A)).toBe(20);
  });
});

describe("a control effect ends and the default controller has left the game (rule 800.4c)", () => {
  it("the permanent is exiled, not handed to its owner", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const object = game.state.objects[bears];
    // Carol put alice's Bears onto the battlefield under her control (her
    // default control, rule 110.2); bob took it from her until end of turn.
    object.controlEffects = [
      { controller: C, timestamp: 1, untilEndOfTurn: false, entered: true },
      { controller: B, timestamp: 2, untilEndOfTurn: true },
    ];
    object.controller = B;
    object.controlEndsAtCleanup = true;
    // Carol leaves: bob controls it, so it isn't exiled with her things.
    game.concede(C);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    // Bob's effect ends; carol, its default controller, has left.
    nextTurn(game);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("distribute up to that many counters among targets, from a trigger", () => {
  it("Lathiel: up to the life gained this turn, divided as the trigger goes on the stack", () => {
    const { game } = table();
    spawn(game, "Lathiel, the Bounteous Dawn");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 4 });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" && s.awaiting.player === A);
    const awaiting = game.state.awaiting;
    const divide = awaiting?.kind === "choose-targets" ? awaiting.divide : undefined;
    expect(divide?.total).toBe(4);
    expect(divide?.upTo).toBe(true);
    // Three of the four: "up to".
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(giant)], division: [1, 2] });
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(2);
  });
});
