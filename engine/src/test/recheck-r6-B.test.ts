/**
 * Need-keys recheck R6, group B (batch 240): the cards whose old blockers
 * have been built and that the engine now runs exactly.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  destroy,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Raiding Schemes", () => {
  it("gives a noncreature spell conspire: two red creatures tap and Lightning Bolt is copied", () => {
    const { game, a } = table();
    spawn(game, "Raiding Schemes");
    lands(game, "Mountain", 1);
    const g1 = spawn(game, "Raging Goblin");
    const g2 = spawn(game, "Goblin Piker");
    pickModes(a, 0);
    pickPermanents(a, g1, g2);
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tapped(game, g1)).toBe(true);
    expect(tapped(game, g2)).toBe(true);
    expect(life(game, B)).toBe(14);
  });

  it("doesn't give a creature spell conspire", () => {
    const { game, a } = table();
    spawn(game, "Raiding Schemes");
    lands(game, "Mountain", 1);
    spawn(game, "Raging Goblin");
    spawn(game, "Goblin Piker");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    cast(game, toHand(game, "Raging Goblin"));
    expect(asked).toBe(false);
  });
});

describe("Psychic Vortex", () => {
  it("draws a card per age counter to stay, and the end step takes a land and the hand", () => {
    const { game, a } = table();
    const vortex = spawn(game, "Psychic Vortex");
    const land = spawn(game, "Wastes");
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    // Turn 1's end step: a land sacrificed, the hand discarded.
    expect(zone(game, land)).toBe("graveyard");
    expect(hand(game).length).toBe(0);
    toStep(game, "precombat-main");
    // Turn 3: one age counter, one card drawn for it, then the draw step's.
    expect(counters(game, vortex, "age")).toBe(1);
    expect(zone(game, vortex)).toBe("battlefield");
    expect(hand(game).length).toBe(2);
  });

  it("is sacrificed when its controller declines to draw", () => {
    const { game, a } = table();
    const vortex = spawn(game, "Psychic Vortex");
    pickModes(a);
    const before = hand(game).length;
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, vortex)).toBe("graveyard");
    // Turn 1's end step discarded the hand (no land to sacrifice); turn 3's draw step drew one.
    expect(before).toBeGreaterThan(0);
    expect(hand(game).length).toBe(1);
  });
});

describe("Dreams of the Dead", () => {
  it("returns a white creature card, which is exiled instead of dying", () => {
    const { game } = table();
    const dreams = spawn(game, "Dreams of the Dead");
    lands(game, "Island", 2);
    const lions = toGraveyard(game, "Savannah Lions");
    game.dispatch({ type: "activate-ability", player: A, source: dreams, abilityIndex: 0, targets: [ref(lions)] });
    settle(game);
    expect(zone(game, lions)).toBe("battlefield");
    destroy(game, lions);
    expect(zone(game, lions)).toBe("exile");
  });

  it("can't return a green creature card", () => {
    const { game } = table();
    const dreams = spawn(game, "Dreams of the Dead");
    lands(game, "Island", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: dreams, abilityIndex: 0, targets: [ref(bears)] })).not.toBeNull();
  });

  it("the returned creature has cumulative upkeep {2}: unpaid, it's sacrificed — and exiled", () => {
    const { game, a } = table();
    const dreams = spawn(game, "Dreams of the Dead");
    lands(game, "Island", 2);
    const lions = toGraveyard(game, "Savannah Lions");
    game.dispatch({ type: "activate-ability", player: A, source: dreams, abilityIndex: 0, targets: [ref(lions)] });
    settle(game);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, lions)).toBe("exile");
  });

  it("paid, it stays with an age counter", () => {
    const { game, a } = table();
    const dreams = spawn(game, "Dreams of the Dead");
    lands(game, "Island", 2);
    const lions = toGraveyard(game, "Savannah Lions");
    game.dispatch({ type: "activate-ability", player: A, source: dreams, abilityIndex: 0, targets: [ref(lions)] });
    settle(game);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, lions)).toBe("battlefield");
    expect(counters(game, lions, "age")).toBe(1);
    expect(game.state.objects[dreams].zone).toBe("battlefield");
  });
});

describe("Thousand-Faced Shadow", () => {
  it("ninjutsu'd in, it makes a token copy of another attacker, tapped and attacking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    lands(game, "Island", 4);
    const shadow = toHand(game, "Thousand-Faced Shadow");
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: lions, defender: B },
    ];
    toStep(game, "declare-blockers");
    a.choosePermanentsFn = () => [bears];
    pickTargets(a, lions);
    const index = game.registry.get("Thousand-Faced Shadow").activated.findIndex((ab) => ab.ninjutsu === true);
    game.dispatch({ type: "activate-ability", player: A, source: shadow, abilityIndex: index, targets: [] });
    settle(game);
    expect(zone(game, shadow)).toBe("battlefield");
    const copies = game.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Savannah Lions" && id !== lions,
    );
    expect(copies.length).toBe(1);
    expect(game.state.objects[copies[0]].tapped).toBe(true);
    expect(game.state.objects[copies[0]].attacking).toBe(B);
    toStep(game, "postcombat-main");
    // Shadow 1 + Lions 2 + the token 2.
    expect(life(game, B)).toBe(15);
  });

  it("cast from hand it doesn't attack, so no token", () => {
    const { game } = table();
    spawn(game, "Savannah Lions");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Thousand-Faced Shadow"));
    const lionsCount = game.battlefield.filter((id) => game.state.objects[id].cardName === "Savannah Lions").length;
    expect(lionsCount).toBe(1);
  });
});
