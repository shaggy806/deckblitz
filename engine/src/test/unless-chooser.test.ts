import { overGame } from "./combat-probe.js";
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  registryOf,
  settle,
  spawn,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import { table as openTable } from "./harness.js";

// An `unless` clause: who may answer (any player reference, or any of a scope)
// and what they may do (`doing`, any effect; `payManaCostOf`, an object's mana
// cost; a sacrifice leaving a target out).

/** A table whose opening hands are gone: what's in hand is what a test put there. */
function table(opts: Parameters<typeof openTable>[0] = {}): ReturnType<typeof openTable> {
  const seated = openTable(opts);
  for (const player of seated.players) seated.game.state.zones.perPlayer[player].hand = [];
  return seated;
}

/** Alice's Lightning Bolt at Bob on the stack, Bob holding priority. */
function boltOnTheStack(game: Game): ObjectId {
  lands(game, "Mountain", 1);
  const bolt = toHand(game, "Lightning Bolt");
  cast(game, bolt, { targets: [ref(B)], settle: false });
  game.dispatch({ type: "pass-priority", player: A });
  return bolt;
}

/** The seat answers every `choose-modes` with these, and how many it was asked. */
function watchModes(seat: ScriptedController, ...modes: readonly number[]): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseModesFn = () => {
    seen.asked += 1;
    return [...modes];
  };
  return seen;
}

const canAttack = (game: Game, player: PlayerId, creature: ObjectId, target: PlayerId | ObjectId): boolean =>
  whyCannotAttack(game.state, registryOf(game), player, creature, target) === null;

describe("an unless option that is any effect the chooser does", () => {
  it("Grip of Amnesia: an empty graveyard can still be exiled, and keeps the spell", () => {
    const { game, a } = table();
    const bolt = boltOnTheStack(game);
    lands(game, "Island", 2, B);
    const seen = watchModes(a, 0);
    expect(graveyard(game, A).length).toBe(0);
    cast(game, toHand(game, "Grip of Amnesia", B), { player: B, targets: [ref(bolt)] });
    expect(seen.asked).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("Grip of Amnesia: declining counters the spell, and the card is still drawn", () => {
    const { game, a } = table();
    const bolt = boltOnTheStack(game);
    lands(game, "Island", 2, B);
    const kept = toGraveyard(game, "Grizzly Bears");
    pickModes(a);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Grip of Amnesia", B), { player: B, targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, kept)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("Grip of Amnesia: taking it exiles its chooser's graveyard, not the caster's", () => {
    const { game, a } = table();
    const bolt = boltOnTheStack(game);
    lands(game, "Island", 2, B);
    const alices = toGraveyard(game, "Grizzly Bears");
    const bobs = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Grip of Amnesia", B), { player: B, targets: [ref(bolt)] });
    expect(zone(game, alices)).toBe("exile");
    expect(zone(game, bobs)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("Perplex: discarding the whole hand keeps the spell", () => {
    const { game, a } = table();
    const bolt = boltOnTheStack(game);
    lands(game, "Island", 2, B);
    lands(game, "Swamp", 1, B);
    const one = toHand(game, "Grizzly Bears");
    const two = toHand(game, "Forest");
    pickModes(a, 0);
    cast(game, toHand(game, "Perplex", B), { player: B, targets: [ref(bolt)] });
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("Tainted Specter: a card put on top is no discard and no damage", () => {
    const { game, a, b } = table();
    const specter = spawn(game, "Tainted Specter");
    lands(game, "Swamp", 3);
    const kept = toHand(game, "Forest", B);
    const other = toHand(game, "Island", B);
    pickTargets(a, B);
    pickModes(b, 0);
    pickFromZone(b, kept);
    activate(game, specter, 0, { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library[0]).toBe(kept);
    expect(zone(game, other)).toBe("hand");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("Tainted Specter: a discard this way deals 1 to each creature and each player", () => {
    const { game, b } = table();
    const specter = spawn(game, "Tainted Specter");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    const gone = toHand(game, "Forest", B);
    pickModes(b);
    activate(game, specter, 0, { targets: [ref(B)] });
    expect(zone(game, gone)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[specter].damageMarked).toBe(1);
  });

  it("Tainted Specter: an empty hand has no way out, discards nothing, deals nothing", () => {
    const { game, b } = table();
    const specter = spawn(game, "Tainted Specter");
    lands(game, "Swamp", 3);
    const seen = watchModes(b, 0);
    expect(hand(game, B).length).toBe(0);
    activate(game, specter, 0, { targets: [ref(B)] });
    expect(seen.asked).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("Cursed Monstrosity: a land card keeps it, and with no land it goes unasked", () => {
    const { game, a } = table();
    const monster = spawn(game, "Cursed Monstrosity");
    lands(game, "Forest", 2);
    const land = toHand(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    const seen = watchModes(a, 0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(monster)] });
    expect(seen.asked).toBe(1);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, monster)).toBe("battlefield");

    // No land card left in hand: the Bears can't answer it.
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(monster)] });
    expect(seen.asked).toBe(1);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, monster)).toBe("graveyard");
  });
});

describe("a sacrifice option that leaves the target out", () => {
  it("Torment of Venom: the target can't be the sacrifice, and another saves the life", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const victim = spawn(game, "Colossal Dreadmaw", B);
    const other = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    const offered = pickPermanents(b, other);
    cast(game, toHand(game, "Torment of Venom"), { targets: [ref(victim)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, victim)).toBe("battlefield");
    expect(offered.offered).not.toContain(victim);
    expect(counters(game, victim, "-1/-1")).toBe(3);
    expect(life(game, B)).toBe(20);
  });

  it("Torment of Venom: only the target to sacrifice, and no hand: its controller loses 3", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const victim = spawn(game, "Colossal Dreadmaw", B);
    const seen = watchModes(b, 0);
    cast(game, toHand(game, "Torment of Venom"), { targets: [ref(victim)] });
    expect(seen.asked).toBe(0);
    expect(zone(game, victim)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("an unless naming one player", () => {
  it("Lim-Dûl's Hex: each player in turn, {B} or {3} or 1 damage", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Lim-Dûl's Hex");
    lands(game, "Swamp", 1, A);
    lands(game, "Mountain", 3, B);
    const alice = watchModes(a, 0); // Pays {B}: not asked about {3}.
    const bob = watchModes(b, 0); // Can't pay {B}: asked once, about {3}.
    const carol = watchModes(c, 0); // Can't pay either: never asked.
    nextTurn(game, "precombat-main");
    nextTurn(game, "precombat-main");
    nextTurn(game, "upkeep");
    settle(game);
    expect(game.state.turn.number).toBe(4);
    expect(alice.asked).toBe(1);
    expect(bob.asked).toBe(1);
    expect(carol.asked).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(19);
    expect(game.state.objects[named(game, "Swamp", A)[0]].tapped).toBe(true);
    expect(named(game, "Mountain", B).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("Energy Vortex: {1} per counter on it, read then, or 3 damage to the chosen player", () => {
    const { game, b } = table();
    lands(game, "Island", 5);
    const vortex = toHand(game, "Energy Vortex");
    cast(game, vortex);
    expect(game.state.objects[vortex].chosenPlayer).toBe(B);
    // No counters: {0}, taken.
    pickModes(b, 0);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(20);
    // Alice's upkeep: {X} for two. Bob's next: one land can't pay {2}.
    nextTurn(game, "upkeep");
    settle(game);
    activate(game, vortex, 0, { x: 2 });
    expect(counters(game, vortex, "vortex")).toBe(2);
    lands(game, "Mountain", 1, B);
    const seen = watchModes(b, 0);
    nextTurn(game, "upkeep");
    settle(game);
    expect(seen.asked).toBe(0);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
    // Alice's upkeep clears them.
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, vortex, "vortex")).toBe(0);
  });

  it("Sivriss: each opponent answers for their own milled card, not the one before", () => {
    const { game, b, c } = table({ players: 3 });
    const sivriss = spawn(game, "Sivriss, Nightmare Speaker");
    const fodder = spawn(game, "Grizzly Bears");
    const second = toLibrary(game, "Forest");
    const first = toLibrary(game, "Island");
    pickModes(b, 0); // Bob pays: the first card stays in the graveyard.
    pickModes(c); // Carol doesn't: only the second card comes back.
    game.dispatch({ type: "activate-ability", player: A, source: sivriss, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("hand");
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
  });

  it("Sivriss: a milled card Rest in Peace exiled isn't returned from the graveyard", () => {
    const { game, b } = table();
    spawn(game, "Rest in Peace", B);
    const sivriss = spawn(game, "Sivriss, Nightmare Speaker");
    const fodder = spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Island");
    pickModes(b);
    game.dispatch({ type: "activate-ability", player: A, source: sivriss, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(zone(game, top)).toBe("exile");
  });
});

describe("an unless over any of a scope, paying an object's mana cost", () => {
  it("Ice Cave: any other player may pay the cost, colours and all, which counters it", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Ice Cave", C);
    lands(game, "Mountain", 1, A);
    lands(game, "Island", 1, B); // Can't make {R}: never asked.
    lands(game, "Mountain", 1, C);
    const alice = watchModes(a, 0);
    const bob = watchModes(b, 0);
    const carol = watchModes(c, 0);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(alice.asked).toBe(0);
    expect(bob.asked).toBe(0);
    expect(carol.asked).toBe(1);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[named(game, "Mountain", C)[0]].tapped).toBe(true);
  });

  it("Ice Cave: the caster is never asked, and with no taker the spell resolves", () => {
    const { game, a, b } = table();
    spawn(game, "Ice Cave");
    lands(game, "Mountain", 2, A);
    lands(game, "Mountain", 1, B);
    const alice = watchModes(a, 0);
    const bob = watchModes(b);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(alice.asked).toBe(0);
    expect(bob.asked).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("Ice Cave: the first who pays ends it, in turn order", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Ice Cave", C);
    lands(game, "Mountain", 1, A);
    lands(game, "Mountain", 1, B);
    lands(game, "Mountain", 1, C);
    watchModes(a, 0);
    const bob = watchModes(b, 0);
    const carol = watchModes(c, 0);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(C)] });
    expect(bob.asked).toBe(1);
    expect(carol.asked).toBe(0);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, C)).toBe(20);
  });

  it("Ice Cave: an X spell's mana cost has the X chosen (rule 107.3h)", () => {
    const { game, b } = table();
    spawn(game, "Ice Cave", B);
    lands(game, "Mountain", 3, A);
    lands(game, "Mountain", 3, B);
    pickModes(b, 0);
    const blaze = toHand(game, "Blaze");
    cast(game, blaze, { x: 2, targets: [ref(B)] });
    expect(zone(game, blaze)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(named(game, "Mountain", B).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("Tariff: the greatest mana value goes unless its controller pays its cost; a tie is chosen", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 2);
    // Alice: a tie at 6 and 6, chooses the Colossal Dreadmaw, can't pay.
    const big = spawn(game, "Colossal Dreadmaw");
    const twin = spawn(game, "Colossal Dreadmaw");
    const small = spawn(game, "Grizzly Bears");
    pickPermanents(a, twin);
    // Bob: {1}{G} for his Bears, which he pays.
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Tariff"));
    expect(zone(game, twin)).toBe("graveyard");
    expect(zone(game, big)).toBe("battlefield");
    expect(zone(game, small)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(named(game, "Forest", B).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("Tariff: the choices come in turn order, and the sacrifices together after them (rule 101.4)", () => {
    const { game, b } = table();
    lands(game, "Plains", 2);
    const alices = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, B);
    let whenBobAnswered = "";
    b.chooseModesFn = () => {
      whenBobAnswered = zone(game, alices);
      return [];
    };
    cast(game, toHand(game, "Tariff"));
    expect(whenBobAnswered).toBe("battlefield");
    expect(zone(game, alices)).toBe("graveyard");
    expect(zone(game, bobs)).toBe("graveyard");
  });

  it("Tariff: a creature with no mana cost can't be paid for (rule 118.6)", () => {
    const { game, b } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 3, B);
    const seen = watchModes(b, 0);
    const token = spawn(game, "Soldier Token", B);
    cast(game, toHand(game, "Tariff"));
    expect(seen.asked).toBe(0);
    expect(game.state.objects[token]?.zone ?? "gone").not.toBe("battlefield");
  });
});

describe("a player effect limiting attacks, by whose creatures and for how long", () => {
  it("Champions of Minas Tirith: no {X}, no attack on you this combat, others yes", () => {
    const { game, b } = table({ players: 3 });
    enter(game, "Champions of Minas Tirith");
    expect(game.state.monarch).toBe(A);
    const bears = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    toHand(game, "Forest", B);
    pickModes(b);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(canAttack(game, B, bears, A)).toBe(false);
    expect(canAttack(game, B, bears, C)).toBe(true);
    // Only Bob's creatures: another player's aren't bound by it.
    expect(canAttack(game, C, carols, A)).toBe(true);
    // Gone once the combat phase ends.
    toStep(game, "postcombat-main", B);
    expect(overGame(game)).toEqual([]);
  });

  it("Champions of Minas Tirith: paying {X}, the cards in their hand, leaves the attack open", () => {
    const { game, b } = table();
    enter(game, "Champions of Minas Tirith");
    const bears = spawn(game, "Grizzly Bears", B);
    toHand(game, "Forest", B);
    lands(game, "Mountain", 2, B);
    pickModes(b, 0);
    nextTurn(game, "begin-combat");
    settle(game);
    const handSize = hand(game, B).length;
    expect(named(game, "Mountain", B).filter((id) => game.state.objects[id].tapped).length).toBe(handSize);
    expect(canAttack(game, B, bears, A)).toBe(true);
  });

  it("Champions of Minas Tirith: no trigger without the monarchy", () => {
    const { game, b } = table();
    enter(game, "Champions of Minas Tirith");
    game.state.monarch = B;
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchModes(b);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(seen.asked).toBe(0);
    expect(canAttack(game, B, bears, A)).toBe(true);
  });

  it("Jace, Multiverse Architect: their creatures can't attack Jaces, and can attack the rest", () => {
    const { game, b } = table();
    const jace = spawn(game, "Jace, Multiverse Architect");
    const other = spawn(game, "Chandra, Torch of Defiance");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(canAttack(game, B, bears, jace)).toBe(false);
    expect(canAttack(game, B, bears, other)).toBe(true);
    expect(canAttack(game, B, bears, A)).toBe(true);
  });

  it("Overencumbered: its tokens, then pay per artifact or no creature attacks this combat", () => {
    const { game, b } = table();
    const aura = toHand(game, "Overencumbered");
    lands(game, "Plains", 2);
    cast(game, aura, { targets: [ref(B)] });
    expect(game.state.objects[aura].attachedToPlayer).toBe(B);
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
    expect(tokensNamed(game, "Junk Token", B)).toBe(1);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchModes(b, 0);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(seen.asked).toBe(0); // Three artifacts, no mana.
    expect(canAttack(game, B, bears, A)).toBe(false);
    toStep(game, "postcombat-main", B);
    expect(overGame(game)).toEqual([]);
  });

  it("Overencumbered: paying {1} each leaves the attack open, and not on Alice's own turn", () => {
    const { game, a, b } = table();
    const aura = toHand(game, "Overencumbered");
    lands(game, "Plains", 2);
    cast(game, aura, { targets: [ref(B)] });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3, B);
    pickModes(b, 0);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(named(game, "Mountain", B).every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(canAttack(game, B, bears, A)).toBe(true);
    // Alice's turn: not the enchanted player's, so nothing asks.
    const alice = watchModes(a);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(alice.asked).toBe(0);
  });
});
