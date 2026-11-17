/**
 * "You may play lands and cast Mutant, Ninja, or Turtle spells from the top of
 * your library. If you cast a creature spell this way, that creature enters
 * with an additional +1/+1 counter on it." (Mikey & Don, Party Planners): a
 * static `mayPlay` from the library top whose `entersWith` reaches only a
 * spell its `gainsIf` matches as it's cast (rule 400.7h) — a creature spell,
 * not a noncreature kindred one — the counter one it enters with (614.1c).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, counters, lands, spawn, table, toLibrary, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card && a.via === "library-top");
const playable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "play-land" && a.card === card);

/** A kindred artifact Turtle — a noncreature Turtle spell (test-only). */
const SHELL = "Test Kindred Shell";
const kindredShell = defineCard({
  name: SHELL,
  manaCost: "{1}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Turtle"],
  text: "",
});

describe("Mikey & Don, Party Planners", () => {
  it("a Ninja creature spell cast from the top enters with an additional +1/+1 counter", () => {
    const { game } = table();
    spawn(game, "Mikey & Don, Party Planners");
    lands(game, "Island", 4);
    const ninja = toLibrary(game, "Ninja of the Deep Hours");
    expect(castable(game, ninja)).toBe(true);
    cast(game, ninja, { via: "library-top" });
    expect(zone(game, ninja)).toBe("battlefield");
    expect(counters(game, ninja, "+1/+1")).toBe(1);
  });

  it("a creature that isn't a Mutant, Ninja or Turtle can't be cast from the top; a land can be played, with no counter", () => {
    const { game } = table();
    spawn(game, "Mikey & Don, Party Planners");
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(castable(game, bears)).toBe(false);
    const forest = toLibrary(game, "Forest");
    expect(playable(game, forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    expect(counters(game, forest, "+1/+1")).toBe(0);
  });

  it("a noncreature Turtle spell cast from the top enters with no counter", () => {
    const { game } = table({ ownRegistry: true });
    game.registry.register(kindredShell);
    spawn(game, "Mikey & Don, Party Planners");
    lands(game, "Island", 1);
    const shell = toLibrary(game, SHELL);
    expect(castable(game, shell)).toBe(true);
    cast(game, shell, { via: "library-top" });
    expect(zone(game, shell)).toBe("battlefield");
    expect(counters(game, shell, "+1/+1")).toBe(0);
  });
});
