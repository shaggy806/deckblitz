/**
 * "The next spell you cast this turn has improvise" (Archway of Innovation):
 * a `grant-spells-this-turn` with `next` and `improvise` — the first spell
 * its controller casts after it resolves has improvise (rule 702.126a) as
 * it's cast, its artifacts each paying {1} of the total cost, and uses the
 * grant up as it becomes cast (601.2i). Beside convoke from another grant,
 * creatures convoke and artifacts improvise in one payment.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, cast, hand, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castsOf = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

describe("Archway of Innovation — the next spell has improvise", () => {
  it("lets the next spell's artifacts pay its generic mana, and only the next", () => {
    const { game } = table();
    lands(game, "Island", 2);
    // With an Island, it enters untapped.
    const archway = spawn(game, "Archway of Innovation");
    const relics = [spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic")];
    const bears = spawn(game, "Grizzly Bears");
    const divination = toHand(game, "Divination");
    // Before the grant: castable from the lands alone, without improvise.
    expect(castsOf(game, divination).length).toBeGreaterThan(0);
    expect(castsOf(game, divination).every((a) => a.convoke === undefined)).toBe(true);
    activate(game, archway, 1);
    expect(game.state.objects[archway].tapped).toBe(true);
    const [offer] = castsOf(game, divination);
    expect(offer?.convoke?.improvise).toBe(true);
    expect([...(offer?.convoke?.candidates ?? [])].sort()).toEqual([...relics].sort());
    expect(offer?.convoke?.candidates).not.toContain(bears);
    const before = hand(game).length;
    cast(game, divination, { convoke: relics.map((creature) => ({ creature })) });
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(relics.map((id) => game.state.objects[id].tapped)).toEqual([true, true]);
    // Used up.
    spawn(game, "Darksteel Relic");
    const second = toHand(game, "Divination");
    expect(castsOf(game, second).every((a) => a.convoke === undefined)).toBe(true);
  });

  it("is used up by the next spell even if it taps no artifact, and ends with the turn", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const archway = spawn(game, "Archway of Innovation");
    spawn(game, "Darksteel Relic");
    activate(game, archway, 1);
    const opt = toHand(game, "Opt");
    cast(game, opt);
    // Three Islands left: castable, but without improvise.
    const divination = toHand(game, "Divination");
    expect(castsOf(game, divination).length).toBeGreaterThan(0);
    expect(castsOf(game, divination).every((a) => a.convoke === undefined)).toBe(true);

    // A grant not used this turn is gone the next.
    nextTurn(game);
    nextTurn(game);
    activate(game, archway, 1);
    nextTurn(game);
    nextTurn(game);
    const third = toHand(game, "Divination");
    expect(castsOf(game, third).length).toBeGreaterThan(0);
    expect(castsOf(game, third).every((a) => a.convoke === undefined)).toBe(true);
  });

  it("goes with a granted convoke: creatures convoke, artifacts improvise", () => {
    const { game } = table();
    const wand = spawn(game, "Wand of the Worldsoul");
    const archway = spawn(game, "Archway of Innovation");
    lands(game, "Island", 2);
    nextTurn(game);
    nextTurn(game);
    activate(game, wand, 1);
    activate(game, archway, 1);
    const relic = spawn(game, "Darksteel Relic");
    const bear = spawn(game, "Grizzly Bears");
    const divination = toHand(game, "Divination");
    const [offer] = castsOf(game, divination);
    expect(offer?.convoke?.alsoImprovise).toBe(true);
    expect([...(offer?.convoke?.candidates ?? [])].sort()).toEqual([relic, bear].sort());
    cast(game, divination, { convoke: [{ creature: relic }, { creature: bear }] });
    expect(zone(game, divination)).toBe("graveyard");
  });

  it("enters tapped without an Island, untapped with one", () => {
    const { game } = table();
    const first = toHand(game, "Archway of Innovation");
    game.dispatch({ type: "play-land", player: A, card: first });
    expect(game.state.objects[first].tapped).toBe(true);
    lands(game, "Island", 1);
    const second = toHand(game, "Archway of Innovation");
    game.dispatch({ type: "play-land", player: A, card: second });
    expect(game.state.objects[second].tapped).toBe(false);
  });
});
