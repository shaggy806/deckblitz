/**
 * Odyssey, batch 2 group B: the clauses most likely to be wrong —
 * Painbringer's "any number" exile cost read as X, Hallowed Healer's
 * threshold-gated ability, Cantivore's count over every graveyard, Screams of
 * the Damned's exile cost, Crashing Centaur's threshold shroud and Patrol
 * Hound's discard cost.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  hand,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  zone,
} from "./harness.js";

const threshold = (n = 7): void => {
  const { game } = current;
  for (let i = 0; i < n; i++) toGraveyard(game, "Wastes");
};
let current: ReturnType<typeof table>;

describe("Painbringer", () => {
  it("exiles the chosen number of graveyard cards and gives -X/-X", () => {
    const { game } = table();
    const bringer = spawn(game, "Painbringer");
    const cards = [toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes")];
    const giant = spawn(game, "Hill Giant", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: bringer,
      abilityIndex: 0,
      targets: [ref(giant)],
      xValue: 2,
    });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [cards[0], cards[1]] });
    settle(game);
    expect(zone(game, cards[0])).toBe("exile");
    expect(zone(game, cards[1])).toBe("exile");
    expect(zone(game, cards[2])).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Hallowed Healer", () => {
  it("can't use its threshold ability below seven cards, and can at seven", () => {
    current = table();
    const { game } = current;
    const healer = spawn(game, "Hallowed Healer");
    const why = game.canDispatch({
      type: "activate-ability",
      player: A,
      source: healer,
      abilityIndex: 1,
      targets: [ref(A)],
    });
    expect(why).not.toBeNull();
    threshold();
    activate(game, healer, 1, { targets: [ref(A)] });
    expect(game.state.objects[healer].tapped).toBe(true);
  });
});

describe("Cantivore", () => {
  it("counts enchantment cards in every graveyard", () => {
    const { game } = table();
    const cantivore = spawn(game, "Cantivore");
    toGraveyard(game, "Pacifism", A);
    toGraveyard(game, "Pacifism", B);
    toGraveyard(game, "Hill Giant", B);
    expect(pt(game, cantivore)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Screams of the Damned", () => {
  it("exiles a graveyard card and deals 1 to each creature and each player", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const screams = spawn(game, "Screams of the Damned");
    const card = toGraveyard(game, "Wastes");
    const giant = spawn(game, "Hill Giant", B);
    game.dispatch({ type: "activate-ability", player: A, source: screams, abilityIndex: 0, targets: [] });
    if (game.state.awaiting?.kind === "choose-from-zone") {
      game.dispatch({ type: "choose-from-zone", player: A, chosen: [card] });
    }
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Crashing Centaur", () => {
  it("has shroud and +2/+2 at threshold", () => {
    current = table();
    const { game } = current;
    const centaur = spawn(game, "Crashing Centaur");
    expect(keywords(game, centaur).has("shroud")).toBe(false);
    threshold();
    expect(keywords(game, centaur).has("shroud")).toBe(true);
    expect(pt(game, centaur)).toEqual({ power: 5, toughness: 6 });
  });
});

describe("Patrol Hound", () => {
  it("discards a card to gain first strike", () => {
    const { game } = table();
    const hound = spawn(game, "Patrol Hound");
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: hound, abilityIndex: 0, targets: [] });
    expect(game.state.awaiting?.kind).toBe("discard");
    game.dispatch({ type: "discard", player: A, cards: [hand(game)[0]] });
    settle(game);
    expect(hand(game).length).toBe(before - 1);
    expect(keywords(game, hound).has("first-strike")).toBe(true);
  });
});
