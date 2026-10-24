/**
 * Emerge (rule 702.119a): "You may cast this spell by paying [cost] and
 * sacrificing a creature rather than paying its mana cost", the total cost
 * then "reduced by an amount of generic mana equal to the sacrificed
 * creature's mana value" — an alternative cost (601.2b, 601.2f–h), the
 * creature chosen as the cost is (702.119c) and sacrificed as it's paid.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, hand, lands, pickTargets, spawn, table, toHand, toStep, zone } from "./harness.js";

const emergeOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "emerge");

const victimsOffered = (game: Game, card: ObjectId) =>
  emergeOffers(game, card)
    .map((o) => (o.kind === "cast-spell" ? o.emergeSacrifice?.object : undefined))
    .sort();

const untappedLands = (game: Game, ids: readonly ObjectId[]) => ids.filter((id) => !game.state.objects[id].tapped).length;

describe("emerge", () => {
  it("is offered once per creature you control whose mana value makes it affordable", () => {
    const { game } = table();
    lands(game, "Island", 3);
    // Wretched Gryff: emerge {5}{U}. Hill Giant (mana value 4) leaves {1}{U};
    // Grizzly Bears (2) leaves {3}{U}, more than three Islands pay.
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    spawn(game, "Colossal Dreadmaw", B);
    const gryff = toHand(game, "Wretched Gryff");
    expect(victimsOffered(game, gryff)).toEqual([giant]);
    const [offer] = emergeOffers(game, gryff);
    expect(offer.kind === "cast-spell" ? offer.emergeSacrifice : undefined).toEqual({
      object: giant,
      cardName: "Hill Giant",
      manaValue: 4,
    });
    expect(offer.kind === "cast-spell" ? offer.sacrifice : undefined).toEqual({ choices: [giant] });
  });

  it("sacrifices the named creature and pays the emerge cost less its mana value", () => {
    const { game } = table();
    const islands = lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const gryff = toHand(game, "Wretched Gryff");
    const before = hand(game).length;
    cast(game, gryff, { via: "emerge", sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, gryff)).toBe("battlefield");
    expect(game.state.objects[gryff].castVia).toBe("emerge");
    // {5}{U} less 4: two Islands.
    expect(untappedLands(game, islands)).toBe(2);
    // "When you cast this spell, draw a card": the Gryff left the hand, the draw came in.
    expect(hand(game).length).toBe(before);
  });

  it("can't reduce coloured mana: a big creature leaves only the coloured part", () => {
    const { game } = table();
    const islands = lands(game, "Island", 2);
    const maw = spawn(game, "Colossal Dreadmaw");
    const gryff = toHand(game, "Wretched Gryff");
    cast(game, gryff, { via: "emerge", sacrifice: maw });
    expect(zone(game, gryff)).toBe("battlefield");
    expect(untappedLands(game, islands)).toBe(1);
  });

  it("a mana value 0 token gives no reduction", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const servo = spawn(game, "Servo Token");
    const gryff = toHand(game, "Wretched Gryff");
    // {5}{U} in full: five Islands don't pay it, six do.
    expect(victimsOffered(game, gryff)).toEqual([]);
    lands(game, "Island", 1);
    expect(victimsOffered(game, gryff)).toEqual([servo]);
  });

  it("reduces the total cost after an increase (rule 601.2f)", () => {
    const { game } = table();
    // Grand Arbiter Augustin IV: alice's spells cost {1} more. {5}{U} + {1} − 4 = {2}{U}.
    spawn(game, "Grand Arbiter Augustin IV", B);
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant");
    const gryff = toHand(game, "Wretched Gryff");
    expect(victimsOffered(game, gryff)).toEqual([]);
    lands(game, "Island", 1);
    expect(victimsOffered(game, gryff)).toEqual([giant]);
  });

  it("lets the sacrificed creature tap for mana first (rule 601.2g)", () => {
    const { game } = table();
    // Llanowar Elves (mana value 1): {5}{U} − 1 = {4}{U}, four Islands and the Elves' {G}.
    lands(game, "Island", 4);
    const elves = spawn(game, "Llanowar Elves");
    const gryff = toHand(game, "Wretched Gryff");
    expect(victimsOffered(game, gryff)).toEqual([elves]);
    cast(game, gryff, { via: "emerge", sacrifice: elves });
    expect(zone(game, gryff)).toBe("battlefield");
    expect(zone(game, elves)).toBe("graveyard");
  });

  it("sacrifices: the creature's dies trigger fires", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const traveler = spawn(game, "Doomed Traveler");
    const gryff = toHand(game, "Wretched Gryff");
    cast(game, gryff, { via: "emerge", sacrifice: traveler });
    expect(zone(game, traveler)).toBe("graveyard");
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Spirit Token")).toBe(true);
  });

  it("is refused with nothing to sacrifice, or another player's creature", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const theirs = spawn(game, "Hill Giant", B);
    const gryff = toHand(game, "Wretched Gryff");
    expect(emergeOffers(game, gryff)).toHaveLength(0);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: gryff, targets: [], via: "emerge" })).toMatch(
      /sacrific/,
    );
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: gryff, targets: [], via: "emerge", sacrifice: theirs }),
    ).toMatch(/sacrific/);
  });

  it("keeps the spell's timing: a creature isn't emerged in combat, a flash one is", () => {
    const g = table();
    const { game } = g;
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const gryff = toHand(game, "Wretched Gryff");
    const fiend = toHand(game, "Elder Deep-Fiend");
    g.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(emergeOffers(game, gryff)).toHaveLength(0);
    expect(victimsOffered(game, fiend)).toContain(giant);
  });

  it("Elder Deep-Fiend's cast trigger taps up to four target permanents", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const giant = spawn(game, "Hill Giant");
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    const fiend = toHand(game, "Elder Deep-Fiend");
    pickTargets(a, theirs[0], theirs[1], null, null);
    // {5}{U}{U} − 4 = {1}{U}{U}.
    cast(game, fiend, { via: "emerge", sacrifice: giant });
    expect(zone(game, fiend)).toBe("battlefield");
    for (const id of theirs) expect(game.state.objects[id].tapped).toBe(true);
  });
});
