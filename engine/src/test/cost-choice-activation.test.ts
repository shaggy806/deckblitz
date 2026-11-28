import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, destroy, keywords, lands, life, nextTurn, ref, settle, spawn, table } from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const offersOf = (game: Game, source: ObjectId, player = A): ActivateOffer[] =>
  game
    .legalActions(player)
    .filter((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source);

// A choice an activation cost makes (`modal` `announced` + `costChoice`):
// chosen as it's activated, before targets (rules 602.2b, 601.2b), but not a
// modal ability (rule 700.2).
describe("a keyword chosen as an activation cost (Phyrexian Splicer)", () => {
  it("offers only the keywords some creature has, each with its own targets", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const splicer = spawn(game, "Phyrexian Splicer");
    spawn(game, "Serra Angel", B);
    spawn(game, "Grizzly Bears");
    const offers = offersOf(game, splicer);
    expect(offers.map((o) => o.modes)).toEqual([[0]]);
    expect(offers[0].text).toBe(
      "{2}, {T}, Choose flying, first strike, trample, or shadow: Until end of turn, target creature with flying loses flying and another target creature gains flying.",
    );
  });

  it("moves the chosen keyword from one creature to another until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const splicer = spawn(game, "Phyrexian Splicer");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, splicer, 0, { modes: [0], targets: [ref(angel), ref(bears)] });
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(keywords(game, angel).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("needs another creature for the second target, and one with the keyword for the first", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const splicer = spawn(game, "Phyrexian Splicer");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    const base = { type: "activate-ability", player: A, source: splicer, abilityIndex: 0, modes: [0] } as const;
    expect(game.canDispatch({ ...base, targets: [ref(angel), ref(angel)] } as Action)).not.toBeNull();
    expect(game.canDispatch({ ...base, targets: [ref(bears), ref(angel)] } as Action)).not.toBeNull();
    expect(game.canDispatch({ ...base, targets: [ref(angel), ref(bears)] } as Action)).toBeNull();
  });

  it("still grants the keyword when the first target is gone (the ruling)", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const splicer = spawn(game, "Phyrexian Splicer");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, splicer, 0, { modes: [0], targets: [ref(angel), ref(bears)], settle: false });
    destroy(game, angel);
    settle(game);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("isn't a modal ability: choosing the keyword faces no dilemma (rule 700.2)", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    spawn(game, "Elim Garak, Simple Tailor");
    const splicer = spawn(game, "Phyrexian Splicer");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, splicer, 0, { modes: [0], targets: [ref(angel), ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });
});
