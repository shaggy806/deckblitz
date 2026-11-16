/**
 * Riot on a token that isn't a copy (rule 702.136a: "You may have this
 * permanent enter with an additional +1/+1 counter on it. If you don't, it
 * gains haste."). Spider-Punk gives it to other Spiders, and a Spider token
 * made under it is asked as it enters, each token for itself: it used to
 * enter with haste and no question.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, attack, cast, counters, keywords, lands, spawn, table, toGraveyard, toHand } from "./harness.js";

const SPIDER = "1/2 Green Spider Token (Reach)";

/** Spider Spawning with `creatures` creature cards in the graveyard: that
 * many Spider tokens. Stops at the first question, or once it has resolved. */
function spawning(game: Game, creatures: number): void {
  for (let i = 0; i < creatures; i += 1) toGraveyard(game, "Grizzly Bears");
  lands(game, "Forest", 5);
  cast(game, toHand(game, "Spider Spawning"), { settle: false });
  game.advanceUntil((s) => s.awaiting !== null || (s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0));
}

const spiders = (game: Game): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === SPIDER);

/** Answers the riot question that is waiting. */
function answer(game: Game, pick: "+1/+1 counter" | "Haste"): void {
  const awaiting = game.state.awaiting;
  expect(awaiting?.kind).toBe("choose-creature-type");
  if (awaiting?.kind !== "choose-creature-type") return;
  expect(awaiting.options).toEqual(["+1/+1 counter", "Haste"]);
  game.dispatch({ type: "choose-creature-type", player: awaiting.player, creatureType: pick });
}

describe("riot on a created token", () => {
  it("asks as the token enters: the counter", () => {
    const { game } = table();
    spawn(game, "Spider-Punk");
    spawning(game, 1);
    // Not on the battlefield while its controller chooses (rule 614.12a).
    expect(spiders(game)).toHaveLength(0);
    answer(game, "+1/+1 counter");
    const [spider] = spiders(game);
    expect(counters(game, spider)).toBe(1);
    expect(keywords(game, spider).has("haste")).toBe(false);
    expect(game.state.awaiting).toBeNull();
  });

  it("asks as the token enters: haste", () => {
    const { game } = table();
    spawn(game, "Spider-Punk");
    spawning(game, 1);
    answer(game, "Haste");
    const [spider] = spiders(game);
    expect(counters(game, spider)).toBe(0);
    expect(keywords(game, spider).has("haste")).toBe(true);
  });

  it("asks each token for itself, and they enter together", () => {
    const { game } = table();
    spawn(game, "Spider-Punk");
    spawning(game, 2);
    answer(game, "+1/+1 counter");
    // The second is still to choose: neither is there yet.
    expect(spiders(game)).toHaveLength(0);
    answer(game, "Haste");
    const made = spiders(game);
    expect(made).toHaveLength(2);
    expect(made.map((id) => counters(game, id)).sort()).toEqual([0, 1]);
    expect(made.filter((id) => keywords(game, id).has("haste"))).toHaveLength(1);
    // The one with the counter is the one without haste.
    for (const id of made) expect(keywords(game, id).has("haste")).toBe(counters(game, id) === 0);
  });

  it("reaches a token that is a Spider by changeling", () => {
    const { game } = table();
    spawn(game, "Spider-Punk");
    const nexus = spawn(game, "Maskwood Nexus");
    lands(game, "Forest", 3);
    // "{3}, {T}: Create a 2/2 blue Shapeshifter creature token with changeling."
    activate(game, nexus, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null || (s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0));
    answer(game, "+1/+1 counter");
    const token = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken);
    expect(token).toBeDefined();
    expect(counters(game, token!)).toBe(1);
  });

  it("still enters tapped and attacking once each has chosen (rule 508.4)", () => {
    const { game, a } = table({ life: 40 });
    spawn(game, "Spider-Punk");
    // Every creature of alice's is a Spider under the Nexus: Hero's Soldiers too.
    spawn(game, "Maskwood Nexus");
    const hero = spawn(game, "Hero of Bladehold");
    const picks = ["+1/+1 counter", "Haste"];
    a.chooseCreatureTypeFn = (_view, _source, options) => picks.shift() ?? options[0];
    attack(game, a, [hero]);
    const soldiers = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken);
    expect(soldiers).toHaveLength(2);
    expect(picks).toHaveLength(0);
    expect(soldiers.map((id) => counters(game, id)).sort()).toEqual([0, 1]);
    // Made tapped and attacking: both dealt combat damage beside Hero's 3.
    expect(soldiers.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.players[B].life).toBeLessThanOrEqual(40 - 3 - 1 - 2);
  });

  it("asks nothing of a Spider token with no riot to have", () => {
    const { game } = table();
    spawning(game, 1);
    expect(game.state.awaiting).toBeNull();
    const [spider] = spiders(game);
    expect(counters(game, spider)).toBe(0);
    expect(keywords(game, spider).has("haste")).toBe(false);
  });

  it("asks nothing of a token an opponent's Spider-Punk doesn't reach, or one that is no Spider", () => {
    const theirs = table().game;
    spawn(theirs, "Spider-Punk", B);
    spawning(theirs, 1);
    expect(theirs.state.awaiting).toBeNull();
    expect(spiders(theirs)).toHaveLength(1);

    const { game } = table();
    spawn(game, "Spider-Punk");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"), { settle: false });
    game.advanceUntil((s) => s.awaiting !== null || (s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0));
    expect(game.state.awaiting).toBeNull();
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].controller === A)).not.toHaveLength(0);
  });
});
