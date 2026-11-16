/**
 * Batch 333 (author-top-cards, 2026-11-16), the cards the lead authored:
 * - Preacher and Wish, and the duration they showed short: "for as long as
 *   ~ remains tapped" and "…you control ~" on an activated ability are
 *   checked continually from activation (`GameObject.untaps`,
 *   `LastKnownRefs.sourceSteady`, rule 611.2b and the rulings of Preacher,
 *   Rubinia Soulsinger and Entrancing Lyre).
 * - Rowan's Talent: an attached `activates-ability` trigger narrowed by the
 *   ability clauses (`loyalty`) and by who activated (`activator: "you"`).
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  hand,
  lands,
  loyalty,
  nextTurn,
  pickModes,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const controllerOf = (game: Game, id: ObjectId) => game.state.objects[id].controller;
const stackSize = (game: Game) => game.state.zones.shared.stack.length;

describe("Preacher", () => {
  it("takes the creature the named opponent picks, for as long as it stays tapped", () => {
    const { game, b } = table();
    const preacher = spawn(game, "Preacher");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(b, () => [giant]);
    game.dispatch({ type: "activate-ability", player: A, source: preacher, abilityIndex: 0, targets: [], otherChooser: B });
    settle(game);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(controllerOf(game, giant)).toBe(A);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Vitalize"));
    expect(game.state.objects[preacher].tapped).toBe(false);
    expect(controllerOf(game, giant)).toBe(B);
  });

  it("does nothing if it untaps before the ability resolves, though tapped again by then", () => {
    const { game, b } = table();
    const preacher = spawn(game, "Preacher");
    const giant = spawn(game, "Hill Giant", B);
    watchTargets(b, () => [giant]);
    game.dispatch({ type: "activate-ability", player: A, source: preacher, abilityIndex: 0, targets: [], otherChooser: B });
    // Bob answers the target as it's activated.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null);
    expect(stackSize(game)).toBe(1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    // Untap it in response, then tap it again, the ability still waiting.
    cast(game, toHand(game, "Vitalize"), { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(game.state.objects[preacher].tapped).toBe(false);
    cast(game, toHand(game, "Pressure Point"), { targets: [ref(preacher)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(game.state.objects[preacher].tapped).toBe(true);
    settle(game);
    expect(stackSize(game)).toBe(0);
    expect(controllerOf(game, giant)).toBe(B);
  });
});

describe("Entrancing Lyre", () => {
  it("an untap before its ability resolves leaves the creature free to untap", () => {
    const { game, a } = table();
    const lyre = spawn(game, "Entrancing Lyre");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    game.dispatch({ type: "activate-ability", player: A, source: lyre, abilityIndex: 0, targets: [ref(bears)], xValue: 2 });
    expect(stackSize(game)).toBe(1);
    // Twitch untaps the Lyre; the Lyre's ability still taps the Bears, but
    // its "doesn't untap" never starts (its ruling).
    pickModes(a, 1);
    cast(game, toHand(game, "Twitch"), { targets: [ref(lyre)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(game.state.objects[lyre].tapped).toBe(false);
    settle(game);
    expect(game.state.objects[lyre].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Wish", () => {
  it("plays one card from the sideboard this turn, chosen as it's played", () => {
    const { game } = table({ sideboard: ["Grizzly Bears", "Llanowar Elves"] });
    lands(game, "Mountain", 3);
    lands(game, "Forest", 3);
    const outside = game.state.outside?.[A] ?? [];
    const named = (name: string) => outside.find((id) => game.state.objects[id].cardName === name)!;
    const bears = named("Grizzly Bears");
    const elves = named("Llanowar Elves");
    const castFrom = (card: ObjectId) => game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === card);
    expect(castFrom(bears)).toBeUndefined();
    cast(game, toHand(game, "Wish"));
    expect(castFrom(bears)).toBeDefined();
    expect(castFrom(elves)).toBeDefined();
    const offer = castFrom(bears);
    if (offer?.kind !== "cast-spell") throw new Error("no offer");
    cast(game, bears, offer.via !== undefined ? { via: offer.via } : {});
    expect(zone(game, bears)).toBe("battlefield");
    expect(castFrom(elves)).toBeUndefined(); // one card
  });

  it("does nothing past this turn", () => {
    const { game } = table({ sideboard: ["Grizzly Bears"] });
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2);
    const bears = (game.state.outside?.[A] ?? [])[0];
    cast(game, toHand(game, "Wish"));
    nextTurn(game);
    nextTurn(game);
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bears)).toBe(false);
  });
});

describe("Rowan's Talent", () => {
  it("copies each loyalty ability you activate of the enchanted planeswalker, adding no loyalty for the copy", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 3;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Rowan's Talent"), { targets: [ref(jace)] });
    const mine = hand(game).length;
    const bobs = hand(game, B).length;
    loyalty(game, jace, 2); // each player draws a card, twice
    expect(hand(game)).toHaveLength(mine + 2);
    expect(hand(game, B)).toHaveLength(bobs + 2);
    expect(counters(game, jace, "loyalty")).toBe(5);
  });

  it("gives the granted +1, which is copied too", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 3;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Rowan's Talent"), { targets: [ref(jace)] });
    activate(game, jace, 3, { targets: [ref(bears)] }); // after Jace's three printed
    expect(counters(game, jace, "loyalty")).toBe(4);
    // +2/+0 from the ability and +2/+0 from its copy, kept on the Bears.
    const bearsNow = computeCharacteristics(game.state, registryOf(game), bears);
    expect(bearsNow.power).toBe(6);
    expect([...bearsNow.keywords]).toEqual(expect.arrayContaining(["first-strike", "trample"]));
  });

  it("on an opponent's planeswalker, their activations aren't copied", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 3;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Rowan's Talent"), { targets: [ref(jace)] });
    nextTurn(game);
    const mine = hand(game).length;
    loyalty(game, jace, 2, { player: B });
    expect(hand(game)).toHaveLength(mine + 1);
  });
});

describe("Duelist of the Mind", () => {
  it("has power equal to the cards its controller drew this turn, in the hand too", () => {
    const { game } = table();
    const duelist = spawn(game, "Duelist of the Mind");
    const inHand = toHand(game, "Duelist of the Mind");
    const power = (id: ObjectId) => computeCharacteristics(game.state, registryOf(game), id).power;
    const drawnBefore = power(duelist);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(power(duelist)).toBe(drawnBefore + 2);
    expect(power(inHand)).toBe(drawnBefore + 2);
    expect(computeCharacteristics(game.state, registryOf(game), duelist).toughness).toBe(3);
    // Bob's draws are Bob's.
    const bobs = spawn(game, "Duelist of the Mind", B);
    expect(power(bobs)).toBe(0);
  });
});

describe("Bring the Ending", () => {
  // Alice casts Divination; Bob answers with Bring the Ending.
  const play = (poison: number, pays: boolean, poisoned: PlayerId = A) => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 5);
    lands(game, "Island", 2, B);
    game.state.players[poisoned].counters.poison = poison;
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return pays ? [0] : [];
    };
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    const before = hand(game).length;
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, toHand(game, "Bring the Ending", B), { player: B, targets: [ref(divination)] });
    // Divination's two cards drawn, or not.
    return { countered: hand(game).length === before, asked };
  };

  it("counters the spell unless its controller pays {2}", () => {
    expect(play(0, true)).toEqual({ countered: false, asked: 1 });
    expect(play(0, false)).toEqual({ countered: true, asked: 1 });
  });

  it("corrupted: counters it outright, nothing asked, when its controller has three poison counters", () => {
    expect(play(3, true)).toEqual({ countered: true, asked: 0 });
    expect(play(2, true)).toEqual({ countered: false, asked: 1 });
    // Another opponent of Bob's poisoned is no one's business here.
    expect(play(3, true, C)).toEqual({ countered: false, asked: 1 });
  });
});

describe("Anoint with Affliction", () => {
  it("exiles a creature of mana value 3 or less, and a bigger one only if its controller is corrupted", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const carols = spawn(game, "Serra Angel", C);
    game.state.players[C].counters.poison = 3; // not the Angel's controller
    cast(game, toHand(game, "Anoint with Affliction"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Anoint with Affliction"), { targets: [ref(angel)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, angel)).toBe("battlefield");
    cast(game, toHand(game, "Anoint with Affliction"), { targets: [ref(carols)] });
    expect(zone(game, carols)).toBe("exile");
  });
});
