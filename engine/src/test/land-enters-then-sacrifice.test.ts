/**
 * "If an opponent who controls at least as many lands as you do would put a
 * land onto the battlefield, that player instead puts that land onto the
 * battlefield then sacrifices a land of their choice" (Land Equilibrium —
 * `OthersEnterReplacement.putBy` and `thenPutter`, rule 614.1a): played or put
 * there by an effect, the land enters and its putter sacrifices a land; one
 * with fewer lands, or Land Equilibrium's controller, doesn't.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, cast, lands, life, nextTurn, settle, spawn, table, toHand } from "./harness.js";

const landsOf = (game: Game, player: PlayerId): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.controller === player && game.registry.get(o.cardName)?.types.includes("land") === true;
  }).length;

/** Bob plays a Forest on his turn. */
function bobPlaysForest(game: Game): void {
  nextTurn(game);
  const forest = toHand(game, "Forest", B);
  game.dispatch({ type: "play-land", player: B, card: forest });
  settle(game);
}

/** A test sorcery: "Put a land card from your hand onto the battlefield, then
 * you gain 1 life for each land you control." */
const SURVEY = "Test Land Survey";
const survey = defineCard({
  name: SURVEY,
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a land card from your hand onto the battlefield, then you gain 1 life for each land you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "battlefield", leftover: "stay", filter: { type: "land" } },
      { kind: "gain-life", amount: { countOf: { type: "land", controlledBy: "you" } } },
    ],
  },
});

describe("Land Equilibrium", () => {
  it("the sacrifice is part of the land's entering: the rest of the spell sees it gone", () => {
    const { game, b } = table({ ownRegistry: true });
    game.registry.register(survey);
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    spawn(game, "Land Equilibrium", A);
    lands(game, "Island", 3, A);
    lands(game, "Forest", 3, B);
    nextTurn(game);
    toHand(game, "Plains", B);
    cast(game, toHand(game, SURVEY, B), { player: B });
    expect(landsOf(game, B)).toBe(3);
    // Three lands as the gain is counted, not four.
    expect(life(game, B)).toBe(23);
  });

  it("an opponent with as many lands plays a land, then sacrifices a land", () => {
    const { game } = table();
    spawn(game, "Land Equilibrium", A);
    lands(game, "Island", 3, A);
    lands(game, "Mountain", 3, B);
    bobPlaysForest(game);
    expect(landsOf(game, B)).toBe(3);
  });

  it("an opponent with fewer lands keeps it", () => {
    const { game } = table();
    spawn(game, "Land Equilibrium", A);
    lands(game, "Island", 3, A);
    lands(game, "Mountain", 2, B);
    bobPlaysForest(game);
    expect(landsOf(game, B)).toBe(3);
  });

  it("its controller's own lands are untouched", () => {
    const { game } = table();
    spawn(game, "Land Equilibrium", A);
    lands(game, "Island", 3, A);
    const forest = toHand(game, "Forest", A);
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(landsOf(game, A)).toBe(4);
  });

  it("a land an opponent's spell puts onto the battlefield counts too", () => {
    const { game, b } = table();
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    spawn(game, "Land Equilibrium", A);
    lands(game, "Island", 2, A);
    lands(game, "Forest", 2, B);
    nextTurn(game);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(landsOf(game, B)).toBe(2);
    // One was found and put there, and one went.
    const sacrificed = game.state.zones.perPlayer[B].graveyard.filter(
      (id) => game.registry.get(game.state.objects[id].cardName)?.types.includes("land") === true,
    );
    expect(sacrificed.length).toBe(1);
  });
});
