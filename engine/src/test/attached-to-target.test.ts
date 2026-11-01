/**
 * What's attached to a target, or to a player: the `attachedToTarget` filter clause ("all Auras
 * attached to it" — Hubris; "all Equipment attached to that creature" — Blastfire Bolt), bound to
 * the slot's target as the effect applies and nothing for a slot illegal as it resolves (rule
 * 608.2b); `attachedToPlayer` ("all Curses attached to you" — Witchbane Orb, rule 303.4); and the
 * `attachedToThan` target relation ("up to one target Equipment attached to that creature" —
 * Fiery Annihilation), checked as targets are chosen and again as it resolves.
 */
import { describe, expect, it } from "vitest";

import { invalidTargetReason, stateTargetFacts } from "../targeting.js";
import { slotOptions } from "../target.js";
import type { TargetSpec } from "../target.js";

import { A, B, cast, destroy, enter, hand, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const attach = (game: ReturnType<typeof table>["game"], what: string, to: string, player = A, host = A) => {
  const target = spawn(game, to, host);
  const attached = spawn(game, what, player);
  game.state.objects[attached].attachedTo = target;
  return { target, attached };
};

describe("Hubris: target creature and all Auras attached to it", () => {
  it("returns the creature and every Aura on it, whoever controls them, and no other Aura", () => {
    const { game } = table();
    lands(game, "Island", 2, A);
    const { target: bears, attached: mine } = attach(game, "Holy Strength", "Grizzly Bears", A, B);
    const theirs = spawn(game, "Pacifism", B);
    game.state.objects[theirs].attachedTo = bears;
    const { attached: elsewhere } = attach(game, "Holy Strength", "Hill Giant", B, B);
    const card = toHand(game, "Hubris", A);
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game, A)).toContain(mine);
    expect(zone(game, elsewhere)).toBe("battlefield");
  });

  it("the creature illegal as it resolves: it doesn't resolve, and its Auras stay", () => {
    const { game } = table();
    lands(game, "Island", 2, A);
    const { target: bears, attached: aura } = attach(game, "Holy Strength", "Grizzly Bears", B, B);
    const card = toHand(game, "Hubris", A);
    cast(game, card, { targets: [ref(bears)], settle: false });
    // Destroyed first: the target is gone.
    destroy(game, bears);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    // The Aura went to the graveyard as a state-based action, not to a hand.
    expect(zone(game, aura)).toBe("graveyard");
  });
});

describe("Blastfire Bolt: destroy all Equipment attached to that creature", () => {
  it("destroys the target's Equipment and not another creature's", () => {
    const { game } = table();
    lands(game, "Mountain", 6, A);
    const { target: giant, attached: blade } = attach(game, "Bonesplitter", "Hill Giant", B, B);
    const { attached: other } = attach(game, "Bonesplitter", "Grizzly Bears", B, B);
    const card = toHand(game, "Blastfire Bolt", A);
    cast(game, card, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, blade)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("an unbound clause (a target's own filter) matches nothing", () => {
    const { game } = table();
    const { attached } = attach(game, "Bonesplitter", "Hill Giant", B, B);
    const why = invalidTargetReason(
      game.state,
      game.registry,
      [{ kind: "permanent", filter: { attachedToTarget: 0 } }],
      [ref(attached)],
      A,
      "it",
    );
    expect(why).toMatch(/illegal/);
  });
});

describe("Witchbane Orb: destroy all Curses attached to you", () => {
  it("destroys the Curses on you, not those on another player", () => {
    const { game } = table();
    const onMe = spawn(game, "Curse of Opulence", B);
    game.state.objects[onMe].attachedToPlayer = A;
    const onBob = spawn(game, "Curse of Opulence", A);
    game.state.objects[onBob].attachedToPlayer = B;
    enter(game, "Witchbane Orb", A);
    expect(zone(game, onMe)).toBe("graveyard");
    expect(zone(game, onBob)).toBe("battlefield");
  });
});

describe("Fiery Annihilation: up to one target Equipment attached to that creature", () => {
  const SPECS: TargetSpec[] = [
    "creature",
    {
      kind: "optional",
      of: { kind: "other", of: { kind: "permanent", filter: { subtype: "Equipment" } }, than: { slot: 0 }, attachedToThan: true },
    },
  ];

  it("offers only Equipment attached to the chosen creature, and refuses another", () => {
    const { game } = table();
    const { target: giant, attached: blade } = attach(game, "Bonesplitter", "Hill Giant", B, B);
    const { attached: other } = attach(game, "Bonesplitter", "Grizzly Bears", B, B);
    const facts = stateTargetFacts(game.state, game.registry);
    expect(slotOptions(SPECS, [[ref(giant)], [ref(blade), ref(other)]], 1, [ref(giant)], facts)).toEqual([ref(blade)]);
    const why = (equipment: ReturnType<typeof ref>) =>
      invalidTargetReason(game.state, game.registry, SPECS, [ref(giant), equipment], A, "Fiery Annihilation");
    expect(why(ref(blade))).toBeNull();
    expect(why(ref(other))).toMatch(/another/);
  });

  it("deals 5, exiles the Equipment, and exiles the creature as it would die", () => {
    const { game } = table();
    lands(game, "Mountain", 3, A);
    const { target: giant, attached: blade } = attach(game, "Bonesplitter", "Hill Giant", B, B);
    const card = toHand(game, "Fiery Annihilation", A);
    cast(game, card, { targets: [ref(giant), ref(blade)] });
    expect(zone(game, blade)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
  });

  it("can target a creature with nothing attached", () => {
    const { game } = table();
    lands(game, "Mountain", 3, A);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Fiery Annihilation", A);
    cast(game, card, { targets: [ref(giant), null] });
    expect(zone(game, giant)).toBe("exile");
  });

  it("the Equipment no longer attached as it resolves is left alone (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 3, A);
    const { target: giant, attached: blade } = attach(game, "Bonesplitter", "Hill Giant", B, B);
    const card = toHand(game, "Fiery Annihilation", A);
    cast(game, card, { targets: [ref(giant), ref(blade)], settle: false });
    game.state.objects[blade].attachedTo = null;
    settle(game);
    expect(zone(game, blade)).toBe("battlefield");
    expect(zone(game, giant)).toBe("exile");
  });

  it("the creature illegal as it resolves leaves the Equipment illegal too (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 3, A);
    const { target: giant, attached: blade } = attach(game, "Bonesplitter", "Hill Giant", B, B);
    const card = toHand(game, "Fiery Annihilation", A);
    cast(game, card, { targets: [ref(giant), ref(blade)], settle: false });
    // The creature leaves before it resolves (and `destroy` lets it resolve).
    destroy(game, giant);
    expect(zone(game, blade)).toBe("battlefield");
    expect(zone(game, card)).toBe("graveyard");
  });
});
