/**
 * A keyword's additional cost that isn't mana (`KickerAlsoCost`): splice's
 * (rule 702.47a — exile, tap, sacrifice, return, an opponent gaining life) and
 * squad's (702.157a), paid any number of times. Each is paid as the spell is
 * cast (601.2h), one at a time, the spell on the stack.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offersOf = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((x): x is CastOffer => x.kind === "cast-spell" && x.card === card);
const graveyardOf = (game: Game, n: number): ObjectId[] =>
  Array.from({ length: n }, () => toGraveyard(game, "Wastes"));

describe("splice: a cost that isn't mana", () => {
  it("Horobi's Whisper: exile four from the graveyard, the spell gaining its text", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 2);
    const whisper = toHand(game, "Horobi's Whisper");
    const ray = toHand(game, "Glacial Ray");
    const cards = graveyardOf(game, 5);
    const victim = spawn(game, "Hill Giant", B);
    const seen = pickFromZone(a, ...cards.slice(0, 4));
    cast(game, ray, { targets: [ref(B), ref(victim)], splice: [whisper] });
    expect(seen.offered).toEqual(cards);
    for (const id of cards.slice(0, 4)) expect(zone(game, id)).toBe("exile");
    expect(zone(game, cards[4])).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(zone(game, victim)).toBe("graveyard");
    // Revealed, not paid: it stays in hand.
    expect(zone(game, whisper)).toBe("hand");
  });

  it("Horobi's Whisper isn't offered with fewer than four to exile", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const whisper = toHand(game, "Horobi's Whisper");
    const ray = toHand(game, "Glacial Ray");
    graveyardOf(game, 3);
    spawn(game, "Hill Giant", B);
    expect(offersOf(game, ray).some((o) => o.splice !== undefined)).toBe(false);
    expect(() => cast(game, ray, { targets: [ref(B), ref(B)], splice: [whisper] })).toThrow();
    // Four are enough, and the words are what the offer shows.
    graveyardOf(game, 1);
    expect(offersOf(game, ray).find((o) => o.splice !== undefined)?.splice).toEqual([
      { object: whisper, cardName: "Horobi's Whisper", cost: "Exile four cards from your graveyard" },
    ]);
  });

  it("Hundred-Talon Strike: tap an untapped white creature, named on the cast", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const strike = toHand(game, "Hundred-Talon Strike");
    const ray = toHand(game, "Glacial Ray");
    const knight = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    const offer = offersOf(game, ray).find((o) => o.splice !== undefined);
    expect(offer?.tapCost?.count).toBe(1);
    expect(offer?.tapCost?.choices).toEqual([knight]);
    cast(game, ray, { targets: [ref(B), ref(bears)], splice: [strike], tap: [knight] });
    expect(game.state.objects[knight].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears).power).toBe(3);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(life(game, B)).toBe(18);
  });

  it("Hundred-Talon Strike: a white creature already tapped can't pay", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    toHand(game, "Hundred-Talon Strike");
    const ray = toHand(game, "Glacial Ray");
    spawn(game, "Savannah Lions", A, { tapped: true });
    spawn(game, "Grizzly Bears");
    expect(offersOf(game, ray).some((o) => o.splice !== undefined)).toBe(false);
  });

  it("two copies of it tap two", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const first = toHand(game, "Hundred-Talon Strike");
    const second = toHand(game, "Hundred-Talon Strike");
    const ray = toHand(game, "Glacial Ray");
    spawn(game, "Savannah Lions");
    spawn(game, "Grizzly Bears");
    // One white creature: either copy, not both.
    expect(offersOf(game, ray).some((o) => o.splice?.length === 2)).toBe(false);
    spawn(game, "Savannah Lions");
    const both = offersOf(game, ray).find((o) => o.splice?.length === 2);
    expect(both?.splice?.map((s) => s.object)).toEqual([first, second]);
    expect(both?.tapCost?.count).toBe(2);
  });

  it("Torrent of Stone: two Mountains, even those that paid for the spell", () => {
    const { game, a } = table();
    const mountains = lands(game, "Mountain", 2);
    const torrent = toHand(game, "Torrent of Stone");
    const ray = toHand(game, "Glacial Ray");
    const giant = spawn(game, "Serra Angel", B);
    pickPermanents(a, ...mountains);
    cast(game, ray, { targets: [ref(B), ref(giant)], splice: [torrent] });
    for (const id of mountains) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("Torrent of Stone needs both", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    const ray = toHand(game, "Glacial Ray");
    toHand(game, "Torrent of Stone");
    spawn(game, "Serra Angel", B);
    expect(offersOf(game, ray).some((o) => o.splice !== undefined)).toBe(false);
  });

  it("Veil of Secrecy: return a blue creature you control, chosen as it's paid", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const veil = toHand(game, "Veil of Secrecy");
    const ray = toHand(game, "Glacial Ray");
    const merfolk = spawn(game, "Coral Merfolk");
    const drake = spawn(game, "Wind Drake");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, merfolk);
    cast(game, ray, { targets: [ref(B), ref(bears)], splice: [veil] });
    expect(zone(game, merfolk)).toBe("hand");
    expect(zone(game, drake)).toBe("battlefield");
    expect(keywords(game, bears).has("shroud")).toBe(true);
  });

  it("Roar of Jukai: the only opponent gains the life, no question asked", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const roar = toHand(game, "Roar of Jukai");
    const ray = toHand(game, "Glacial Ray");
    cast(game, ray, { targets: [ref(B)], splice: [roar] });
    expect(life(game, B)).toBe(23);
  });

  it("Roar of Jukai: with several opponents, the caster picks who", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 2);
    const roar = toHand(game, "Roar of Jukai");
    const ray = toHand(game, "Glacial Ray");
    const asked: string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(...(texts ?? []));
      return [1];
    };
    cast(game, ray, { targets: [ref(B)], splice: [roar] });
    expect(asked).toEqual(["Have bob gain 5 life", "Have carol gain 5 life"]);
    expect(life(game, C)).toBe(25);
    expect(life(game, B)).toBe(18);
  });

  it("Roar of Jukai: it's the spell's own condition that pumps, not the cost", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 1);
    lands(game, "Mountain", 2);
    const roar = toHand(game, "Roar of Jukai");
    const ray = toHand(game, "Glacial Ray");
    const blocker = spawn(game, "Grizzly Bears");
    const attacker = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker, defender: A }];
    a.declareBlockersFn = () => [{ blocker, attacker }];
    game.advanceUntil(
      (s) => s.turn.number === 2 && s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null,
    );
    expect(game.state.turn.step).toBe("declare-blockers");
    cast(game, ray, { targets: [ref(B)], splice: [roar], settle: false });
    expect(life(game, B)).toBe(25);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder === A);
    // Bob's blocked attacker got the +2/+2; the blocker didn't.
    expect(pt(game, attacker).power).toBe(5);
    expect(pt(game, blocker).power).toBe(2);
  });

  it("several spliced cards are paid one after another", () => {
    const { game, a } = table();
    const mountains = lands(game, "Mountain", 2);
    const whisper = toHand(game, "Horobi's Whisper");
    const veil = toHand(game, "Veil of Secrecy");
    const torrent = toHand(game, "Torrent of Stone");
    const ray = toHand(game, "Glacial Ray");
    const cards = graveyardOf(game, 5);
    const merfolk = spawn(game, "Coral Merfolk");
    const drake = spawn(game, "Wind Drake");
    const angel = spawn(game, "Serra Angel", B);
    const hill = spawn(game, "Hill Giant", B);
    // The two Mountains are all there are, so the return and the exile ask.
    const returned = pickPermanents(a, merfolk);
    const exiled = pickFromZone(a, ...cards.slice(0, 4));
    expect(offersOf(game, ray).some((o) => o.splice?.length === 3)).toBe(true);
    cast(game, ray, { targets: [ref(B), ref(hill), ref(merfolk), ref(angel)], splice: [whisper, veil, torrent] });
    expect(returned.offered).toEqual([merfolk, drake]);
    // Paid in any order (rule 601.2h): the Mountains sacrificed first are there.
    expect(exiled.offered).toEqual([...cards, ...mountains]);
    for (const id of mountains) expect(zone(game, id)).toBe("graveyard");
    expect(cards.slice(0, 4).every((id) => zone(game, id) === "exile")).toBe(true);
    expect(zone(game, merfolk)).toBe("hand");
    expect(zone(game, drake)).toBe("battlefield");
    expect(zone(game, angel)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].hand).toEqual(expect.arrayContaining([whisper, veil, torrent]));
    expect(game.state.pendingAlsoCosts).toBeUndefined();
  });

  it("the costs stand when the spell is countered", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const whisper = toHand(game, "Horobi's Whisper");
    const ray = toHand(game, "Glacial Ray");
    const counterspell = toHand(game, "Counterspell");
    const cards = graveyardOf(game, 4);
    const victim = spawn(game, "Hill Giant", B);
    pickFromZone(a, ...cards);
    cast(game, ray, { targets: [ref(B), ref(victim)], splice: [whisper], settle: false });
    expect(cards.every((id) => zone(game, id) === "exile")).toBe(true);
    cast(game, counterspell, { targets: [ref(ray)] });
    expect(zone(game, ray)).toBe("graveyard");
    expect(zone(game, victim)).toBe("battlefield");
    expect(cards.every((id) => zone(game, id) === "exile")).toBe(true);
  });
});

describe("squad: any number of times, not only mana", () => {
  it("Ruthless Radrat offers once per four cards in the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const radrat = toHand(game, "Ruthless Radrat");
    graveyardOf(game, 9);
    expect(offersOf(game, radrat).map((o) => o.kickCount ?? 0).sort()).toEqual([0, 1, 2]);
    // Each number of times reads differently on its button.
    expect(offersOf(game, radrat).flatMap((o) => o.kickerCost ?? [])).toEqual([
      "Exile four cards from your graveyard",
      "Exile four cards from your graveyard ×2",
    ]);
  });

  it("Ruthless Radrat exiles four a time and makes a copy for each", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const radrat = toHand(game, "Ruthless Radrat");
    const cards = graveyardOf(game, 9);
    const seen = pickFromZone(a, ...cards.slice(0, 8));
    cast(game, radrat, { kicked: true, kickCount: 2 });
    expect(seen.offered).toEqual(cards);
    expect(cards.slice(0, 8).every((id) => zone(game, id) === "exile")).toBe(true);
    expect(zone(game, cards[8])).toBe("graveyard");
    expect(named(game, "Ruthless Radrat", A)).toHaveLength(3);
    expect(tokensNamed(game, "Ruthless Radrat", A)).toBe(2);
  });

  it("Ruthless Radrat unkicked pays nothing and makes none", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const radrat = toHand(game, "Ruthless Radrat");
    const cards = graveyardOf(game, 4);
    cast(game, radrat);
    expect(cards.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(named(game, "Ruthless Radrat", A)).toHaveLength(1);
  });

  it("Ruthless Radrat refuses more than the graveyard pays", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const radrat = toHand(game, "Ruthless Radrat");
    graveyardOf(game, 7);
    expect(() => cast(game, radrat, { kicked: true, kickCount: 2 })).toThrow();
  });

  it("Thrill-Kill Disciple pays {1} and a card each time", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const disciple = toHand(game, "Thrill-Kill Disciple");
    const first = toHand(game, "Wastes");
    const second = toHand(game, "Wastes");
    const third = toHand(game, "Wastes");
    // {2}{R} and {1} twice: five mana, with cards to spare but no third {1}.
    expect(offersOf(game, disciple).map((o) => o.kickCount ?? 0).sort()).toEqual([0, 1, 2]);
    let asked = 0;
    a.chooseDiscardsFn = (_cards, count) => {
      asked = count;
      return [first, third];
    };
    cast(game, disciple, { kicked: true, kickCount: 2 });
    expect(asked).toBe(2);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, third)).toBe("graveyard");
    expect(hand(game)).toContain(second);
    expect(named(game, "Thrill-Kill Disciple", A)).toHaveLength(3);
    expect(graveyard(game)).toHaveLength(2);
  });

  it("Thrill-Kill Disciple is bounded by the hand too", () => {
    const { game } = table();
    const disciple = toHand(game, "Thrill-Kill Disciple");
    const others = hand(game).length - 1;
    lands(game, "Mountain", 3 + others + 3);
    const counts = offersOf(game, disciple).map((o) => o.kickCount ?? 0);
    expect(Math.max(...counts)).toBe(others);
  });

  it("Thrill-Kill Disciple leaves a Junk behind", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const disciple = toHand(game, "Thrill-Kill Disciple");
    cast(game, disciple);
    destroy(game, disciple);
    settle(game);
    expect(zone(game, disciple)).toBe("graveyard");
    expect(tokensNamed(game, "Junk Token", A)).toBe(1);
  });
});
