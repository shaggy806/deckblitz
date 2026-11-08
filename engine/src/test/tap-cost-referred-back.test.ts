/**
 * A tap cost on one specific permanent that the rest of the card refers back
 * to: an Aura's "Tap enchanted creature" (`tapOthers` of `{ hostOfSource: true }`
 * — not the {T} of rule 302.6, and unpayable once tapped, rule 118.3), and a
 * spell's "tap an untapped creature you control" as an additional cost, whose
 * text names "the creature tapped to pay this spell's additional cost"
 * (`ObjectRef` `"tapped"`, a copy's the original's, rule 707.10).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;

const offers = (game: Game, source: ObjectId, index = 0): Offer[] =>
  game.legalActions(A).filter((a): a is Offer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

/** `aura` cast from the hand onto `host`, paid by fresh Swamps. */
function enchant(game: Game, aura: string, host: ObjectId, player: PlayerId = A): ObjectId {
  lands(game, "Swamp", 3, player);
  lands(game, "Forest", 1, player);
  const id = toHand(game, aura, player);
  cast(game, id, { player, targets: [ref(host)] });
  expect(game.state.objects[id].attachedTo).toBe(host);
  return id;
}

describe("Tap enchanted creature", () => {
  it("Krovikan Plague: taps the host, no {T} rule, 1 damage and a -0/-1 counter on it", () => {
    const { game } = table();
    // Just arrived: "Tap enchanted creature" isn't the {T} of rule 302.6.
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const other = spawn(game, "Glory Seeker");
    const plague = enchant(game, "Krovikan Plague", bears);

    // The one permanent it's on, whatever else there is to tap: no choice.
    expect(offers(game, plague)[0]?.tapCost?.choices).toEqual([bears]);
    activate(game, plague, 0, { targets: [ref(B)] });

    expect(tapped(game, bears)).toBe(true);
    expect(tapped(game, other)).toBe(false);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].counters["-0/-1"]).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 1 });
  });

  it("Krovikan Plague: not while the host is tapped (rule 118.3), and again once it untaps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const plague = enchant(game, "Krovikan Plague", bears);
    activate(game, plague, 0, { targets: [ref(B)] });
    expect(offers(game, plague)).toEqual([]);
    expect(() => activate(game, plague, 0, { targets: [ref(B)] })).toThrow(/untapped/);

    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(bears)]);
    settle(game);
    activate(game, plague, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    // Toughness 2, two -0/-1 counters: the state-based action takes it, and the Aura.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, plague)).toBe("graveyard");
  });

  it("Krovikan Plague: the Aura gone in response still does both, on what it last enchanted", () => {
    const { game } = table();
    const bears = spawn(game, "Glory Seeker");
    const plague = enchant(game, "Krovikan Plague", bears);
    activate(game, plague, 0, { targets: [ref(B)], settle: false });
    expect(tapped(game, bears)).toBe(true);
    destroy(game, plague);
    settle(game);
    expect(zone(game, plague)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].counters["-0/-1"]).toBe(1);
  });

  it("Krovikan Plague: draws at the next turn's upkeep, on no Wall, and goes if the creature does", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Omens");
    lands(game, "Swamp", 3);
    const refused = toHand(game, "Krovikan Plague");
    expect(() => cast(game, refused, { targets: [ref(wall)] })).toThrow();
    expect(() => cast(game, refused, { targets: [ref(spawn(game, "Grizzly Bears", B))] })).toThrow();

    cast(game, refused, { targets: [ref(bears)] });
    const before = hand(game).length;
    nextTurn(game, "upkeep");
    settle(game);
    // Alice's Plague draws for Alice, in Bob's upkeep.
    expect(hand(game).length).toBe(before + 1);

    // The ruling: lose control of the creature and the Aura goes (rule 704.5m).
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    nextTurn(game);
    expect(graveyard(game)).toContain(refused);
  });

  it("Nature's Chosen: {0} untaps it on your turn only, once; the tap needs it white, once a turn", () => {
    const { game } = table();
    const lions = spawn(game, "Savannah Lions");
    const land = spawn(game, "Forest", A, { tapped: true });
    const chosen = enchant(game, "Nature's Chosen", lions);

    // White: tap it to untap a land.
    activate(game, chosen, 1, { targets: [ref(land)] });
    expect(tapped(game, lions)).toBe(true);
    expect(tapped(game, land)).toBe(false);
    // Once each turn, each.
    activate(game, chosen, 0);
    expect(tapped(game, lions)).toBe(false);
    expect(offers(game, chosen, 1)).toEqual([]);
    expect(offers(game, chosen, 0)).toEqual([]);

    // Not on someone else's turn, the tap being a different ability.
    nextTurn(game, "precombat-main");
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(offers(game, chosen, 0)).toEqual([]);
    expect(offers(game, chosen, 1).length).toBeGreaterThan(0);
  });

  it("Nature's Chosen: a creature that isn't white can't be tapped for it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const land = spawn(game, "Forest", A, { tapped: true });
    const chosen = enchant(game, "Nature's Chosen", bears);
    expect(offers(game, chosen, 1)).toEqual([]);
    expect(() => activate(game, chosen, 1, { targets: [ref(land)] })).toThrow();
    expect(tapped(game, bears)).toBe(false);
  });

  it("Earthlore: tap the land for a blocking creature, and not a tapped land", () => {
    const { game, a, b } = table();
    const forest = spawn(game, "Forest");
    const attacker = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    const lore = enchant(game, "Earthlore", forest);
    expect(offers(game, lore)).toEqual([]); // nothing blocking

    a.declareAttackersFn = () => [{ attacker, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker }];
    toStep(game, "declare-blockers");

    // The cast of it tapped this Forest: a tapped land can't pay.
    expect(tapped(game, forest)).toBe(true);
    expect(offers(game, lore)).toEqual([]);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(forest)]);

    activate(game, lore, 0, { targets: [ref(blocker)] });
    expect(tapped(game, forest)).toBe(true);
    expect(pt(game, blocker)).toEqual({ power: 3, toughness: 4 });
    expect(offers(game, lore)).toEqual([]);
  });
});

describe("the creature tapped to pay an additional cost", () => {
  function board(): { game: Game; bears: ObjectId; enemy: ObjectId; whole: ObjectId } {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const enemy = spawn(game, "Glory Seeker", B, { tapped: true });
    return { game, bears, enemy, whole: toHand(game, "Swallow Whole") };
  }

  it("Swallow Whole: exile the tapped creature, a counter on the one tapped, summoning sick or not", () => {
    const { game, bears, enemy, whole } = board();
    cast(game, whole, { targets: [ref(enemy)], tap: [bears] });
    expect(tapped(game, bears)).toBe(true);
    expect(zone(game, enemy)).toBe("exile");
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Swallow Whole: exactly one creature, and only a tapped target", () => {
    const { game, bears, enemy, whole } = board();
    const second = spawn(game, "Glory Seeker");
    expect(() => cast(game, whole, { targets: [ref(enemy)], tap: [bears, second] })).toThrow();
    // Untapped: not a legal target, though the cost would have tapped it (601.2c before 601.2h).
    const open = spawn(game, "Glory Seeker", B);
    expect(() => cast(game, whole, { targets: [ref(open)], tap: [bears] })).toThrow();
    // A creature of Bob's can't pay.
    expect(() => cast(game, whole, { targets: [ref(enemy)], tap: [open] })).toThrow();
  });

  it("Swallow Whole: no untapped creature, no cast", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const enemy = spawn(game, "Glory Seeker", B, { tapped: true });
    const whole = toHand(game, "Swallow Whole");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === whole)).toBe(false);
    expect(() => cast(game, whole, { targets: [ref(enemy)] })).toThrow();
  });

  it("Swallow Whole: the target is exiled with the tapped creature gone, and no counter is put", () => {
    const { game, bears, enemy, whole } = board();
    cast(game, whole, { targets: [ref(enemy)], tap: [bears], settle: false });
    destroy(game, bears);
    settle(game);
    expect(zone(game, enemy)).toBe("exile");
    expect(game.state.objects[bears].counters["+1/+1"] ?? 0).toBe(0);
  });

  it("Swallow Whole: an illegal target and the spell doesn't resolve, so no counter", () => {
    const { game, bears, enemy, whole } = board();
    cast(game, whole, { targets: [ref(enemy)], tap: [bears], settle: false });
    game.debugApplyEffect(B, { kind: "untap", target: 0 }, [ref(enemy)]);
    settle(game);
    expect(zone(game, enemy)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });

  it("Swallow Whole: a copy puts its counter on the creature tapped for the original", () => {
    const { game, bears, enemy, whole } = board();
    lands(game, "Island", 2);
    const twincast = toHand(game, "Twincast");
    cast(game, whole, { targets: [ref(enemy)], tap: [bears], settle: false });
    cast(game, twincast, { targets: [ref(whole)], settle: false });
    settle(game);
    expect(game.eventsOfType("spell-copied").length).toBe(1);
    expect(zone(game, enemy)).toBe("exile");
    // The copy's: it resolved first and took the target, so the original fizzled.
    expect(counters(game, bears)).toBe(1);
  });
});
