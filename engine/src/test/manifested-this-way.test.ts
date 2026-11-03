/**
 * What a create or manifest step put onto the battlefield, as a this-way
 * reference: manifest dread an amount of times (rule 701.62a), counters on
 * "those creatures" through `{ thisWay: "put-onto-battlefield" }`, and
 * `put-counters-of` onto the tokens this resolution created.
 *
 * Proving cards: Valgavoth's Onslaught, Wildcall, Formless Nurturing,
 * Ambitious Augmenter, Moldering Gym // Weight Room.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, counters, destroy, lands, named, spawn, table, toHand, toLibrary } from "./harness.js";

const faceDown = (game: ReturnType<typeof table>["game"]) =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined);

describe("manifested this way", () => {
  it("Valgavoth's Onslaught manifests dread X times and counters each of them", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Grizzly Bears");
    // Each look keeps the first card offered.
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Valgavoth's Onslaught"), { x: 2 });
    const manifested = faceDown(game);
    expect(manifested).toHaveLength(2);
    for (const id of manifested) expect(counters(game, id)).toBe(2);
    // Bob's creature isn't one of "those creatures".
    expect(counters(game, named(game, "Grizzly Bears", B)[0])).toBe(0);
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(3);
  });

  it("Wildcall puts X counters on the card it manifested, Formless Nurturing one", () => {
    const { game } = table();
    lands(game, "Forest", 9);
    cast(game, toHand(game, "Wildcall"), { x: 3 });
    const [first] = faceDown(game);
    expect(counters(game, first)).toBe(3);
    cast(game, toHand(game, "Formless Nurturing"));
    const second = faceDown(game).find((id) => id !== first)!;
    expect(counters(game, second)).toBe(1);
    expect(counters(game, first)).toBe(3);
  });

  it("Weight Room's unlock manifests dread and puts three counters on that creature", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Moldering Gym // Weight Room"), { face: 2 });
    const [creature] = faceDown(game);
    expect(counters(game, creature)).toBe(3);
  });
});

describe("counters onto the token just created", () => {
  it("Ambitious Augmenter's Fractal gets every counter it had", () => {
    const { game } = table();
    const augmenter = spawn(game, "Ambitious Augmenter");
    game.state.objects[augmenter].counters = { "+1/+1": 2, oil: 1 };
    destroy(game, augmenter);
    const [fractal] = named(game, "Fractal Token", A);
    expect(fractal).toBeDefined();
    expect(counters(game, fractal)).toBe(2);
    expect(counters(game, fractal, "oil")).toBe(1);
  });

  it("makes nothing when the Augmenter had no counters", () => {
    const { game } = table();
    destroy(game, spawn(game, "Ambitious Augmenter"));
    expect(named(game, "Fractal Token", A)).toHaveLength(0);
  });
});
