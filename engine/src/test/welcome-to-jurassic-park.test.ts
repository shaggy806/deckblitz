/**
 * Welcome to . . . // Jurassic Park, whole, both faces — no engine code of
 * its own: per-opponent optional targets (The True Scriptures' shape), a
 * `become` that lasts "for as long as you control this Saga" (rule 611.2b,
 * `"while-you-control-source"`), `flicker` transformed under your control
 * and Underworld Breach's escape grant narrowed to Dinosaur cards.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  destroy,
  keywords,
  lands,
  named,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const faceOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

interface Park {
  game: Game;
  a: ScriptedController;
  saga: ObjectId;
  ring: ObjectId;
  dagger: ObjectId;
  thopter: ObjectId;
  mine: ObjectId;
  seen: ReturnType<typeof watchTargets>;
}

/** Three players. Alice casts Welcome to . . . on her turn 1, its chapter I
 * targeting bob's Sol Ring and carol's Cloak and Dagger — unless `resolve` is
 * false, which leaves the chapter ability on the stack. */
function welcome(resolve = true): Park {
  const { game, a } = table({ players: 3 });
  const ring = spawn(game, "Sol Ring", B);
  const thopter = spawn(game, "Ornithopter", B);
  // A kindred artifact: Rogue Equipment.
  const dagger = spawn(game, "Cloak and Dagger", C);
  const mine = spawn(game, "Sol Ring", A);
  lands(game, "Forest", 3);
  const seen = watchTargets(a, () => [ring, dagger]);
  const saga = toHand(game, "Welcome to . . .");
  cast(game, saga, { settle: false });
  game.advanceUntil((s) => s.objects[saga].zone === "battlefield" && s.zones.shared.stack.length === 1);
  if (resolve) settle(game);
  return { game, a, saga, ring, dagger, thopter, mine, seen };
}

const isWall = (game: Game, id: ObjectId): boolean => types(game, id).includes("creature") && subtypes(game, id).includes("Wall");

describe("Welcome to . . .", () => {
  it("chapter I: up to one noncreature artifact of each opponent becomes a 0/4 Wall artifact creature with defender", () => {
    const { game, saga, ring, dagger, thopter, mine, seen } = welcome();
    expect(game.state.objects[saga].counters.lore).toBe(1);
    // One slot per opponent: only their noncreature artifacts, never yours.
    expect(seen.offered.filter((slot) => slot.length > 0)).toEqual([[ring], [dagger]]);
    expect(seen.offered.flat()).not.toContain(thopter);
    expect(seen.offered.flat()).not.toContain(mine);
    for (const id of [ring, dagger]) {
      expect(pt(game, id)).toEqual({ power: 0, toughness: 4 });
      // Its other types stay: the Sol Ring's artifact, the Cloak's kindred.
      expect([...types(game, id)].sort()).toEqual(id === ring ? ["artifact", "creature"] : ["artifact", "creature", "kindred"]);
      expect(keywords(game, id).has("defender")).toBe(true);
      expect(isWall(game, id)).toBe(true);
    }
    // Its subtypes that aren't creature types stay, and Wall replaces the
    // creature type it had (rule 205.1b).
    expect([...subtypes(game, dagger)].sort()).toEqual(["Equipment", "Wall"]);
    // Not just this turn.
    toStep(game, "precombat-main", B);
    expect(isWall(game, ring)).toBe(true);
  });

  it("chapter I may target nothing at all", () => {
    const { game, a } = table({ players: 3 });
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 3);
    watchTargets(a);
    cast(game, toHand(game, "Welcome to . . ."));
    expect(isWall(game, ring)).toBe(false);
  });

  it("the Walls end as the Saga leaves the battlefield", () => {
    const { game, saga, ring, dagger } = welcome();
    destroy(game, saga);
    expect(isWall(game, ring)).toBe(false);
    expect(isWall(game, dagger)).toBe(false);
    expect(types(game, ring)).toEqual(["artifact"]);
  });

  it("the Walls end for good as the Saga changes hands", () => {
    const { game, saga, ring } = welcome();
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [ref(saga)]);
    settle(game);
    expect(controller(game, saga)).toBe(B);
    expect(isWall(game, ring)).toBe(false);
    toStep(game, "precombat-main", C);
    expect(controller(game, saga)).toBe(A);
    expect(isWall(game, ring)).toBe(false);
  });

  it("nothing becomes a Wall if the Saga left before chapter I resolved (its ruling, rule 611.2b)", () => {
    const { game, saga, ring, dagger } = welcome(false);
    destroy(game, saga);
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(isWall(game, ring)).toBe(false);
    expect(isWall(game, dagger)).toBe(false);
  });

  it("chapter II makes a 3/3 trampling Dinosaur with haste this turn only", () => {
    const { game, saga } = welcome();
    toStep(game, "precombat-main", A);
    settle(game);
    expect(game.state.objects[saga].counters.lore).toBe(2);
    const [dinosaur] = named(game, "Dinosaur Token", A);
    expect(pt(game, dinosaur)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, dinosaur)).toContain("Dinosaur");
    expect(keywords(game, dinosaur).has("trample")).toBe(true);
    expect(keywords(game, dinosaur).has("haste")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(keywords(game, dinosaur).has("haste")).toBe(false);
    expect(keywords(game, dinosaur).has("trample")).toBe(true);
  });

  it("chapter III destroys all Walls and returns as Jurassic Park under your control", () => {
    const { game, saga, ring, dagger, thopter } = welcome();
    const omens = spawn(game, "Wall of Omens", C);
    toStep(game, "precombat-main", A);
    settle(game);
    toStep(game, "precombat-main", A);
    settle(game);
    for (const id of [ring, dagger, omens]) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(faceOf(game, saga)).toBe("Jurassic Park");
    expect(zone(game, saga)).toBe("battlefield");
    expect(controller(game, saga)).toBe(A);
    expect(types(game, saga)).toEqual(["land"]);
    expect(supertypes(game, saga)).toEqual(["legendary"]);
    expect(game.state.objects[saga].counters.lore ?? 0).toBe(0);
  });
});

describe("Jurassic Park", () => {
  /** Jurassic Park on alice's battlefield, by way of the Saga's chapter III. */
  function park(): { game: Game; park: ObjectId } {
    const made = welcome();
    toStep(made.game, "precombat-main", A);
    settle(made.game);
    toStep(made.game, "precombat-main", A);
    settle(made.game);
    expect(faceOf(made.game, made.saga)).toBe("Jurassic Park");
    return { game: made.game, park: made.saga };
  }

  it("taps for {G} for each Dinosaur you control", () => {
    const { game, park: land } = park();
    // Chapter II's token, and one more.
    spawn(game, "Colossal Dreadmaw");
    spawn(game, "Colossal Dreadmaw", B);
    activate(game, land, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G", "G"]);
  });

  it("gives each Dinosaur card in your graveyard escape for its mana cost and three other cards", () => {
    const { game, park: land } = park();
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    const bears = toGraveyard(game, "Grizzly Bears");
    const fodder = [bears, toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes")];
    lands(game, "Forest", 6);
    const escape = (card: ObjectId, exile: readonly ObjectId[]): Extract<Action, { type: "cast-spell" }> => ({
      type: "cast-spell",
      player: A,
      card,
      targets: [],
      via: "escape",
      graveyardGrant: { source: land },
      escapeExile: exile,
    });
    // Not a Dinosaur card; not with two other cards; not bob's Dinosaur.
    expect(game.canDispatch(escape(bears, [dreadmaw, fodder[1], fodder[2]]))).not.toBeNull();
    expect(game.canDispatch(escape(dreadmaw, fodder.slice(0, 2)))).not.toBeNull();
    expect(game.canDispatch(escape(dreadmaw, fodder))).toBeNull();
    game.dispatch(escape(dreadmaw, fodder));
    settle(game);
    expect(zone(game, dreadmaw)).toBe("battlefield");
    for (const id of fodder) expect(zone(game, id)).toBe("exile");
  });
});
