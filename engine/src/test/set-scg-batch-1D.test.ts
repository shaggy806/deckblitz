/**
 * Scourge (SCG) — group D of the set walk: cost reducers, morph payoffs,
 * Lingering Death's end-step sacrifice and Trap Digger's trap counters.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const attachTo = (game: Game, aura: ObjectId, creature: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(creature), ref(aura)]);
  settle(game);
};

describe("Rush of Knowledge", () => {
  it("draws cards equal to the greatest mana value among permanents you control", () => {
    const { game } = table();
    lands(game, "Island", 5);
    spawn(game, "Hill Giant");
    spawn(game, "Craw Wurm", B);
    const rush = toHand(game, "Rush of Knowledge");
    const before = hand(game).length;
    cast(game, rush);
    expect(hand(game).length).toBe(before - 1 + 4);
  });
});

describe("Edgewalker", () => {
  it("makes a Cleric spell cost {W}{B} less, leaving the generic part", () => {
    const { game } = table();
    spawn(game, "Edgewalker");
    lands(game, "Wastes", 1);
    const second = toHand(game, "Edgewalker");
    cast(game, second);
    expect(zone(game, second)).toBe("battlefield");
  });
});

describe("Krosan Drover", () => {
  it("makes a creature spell with mana value 6 or greater cost {2} less", () => {
    const { game } = table();
    spawn(game, "Krosan Drover");
    lands(game, "Forest", 4);
    const wurm = toHand(game, "Craw Wurm");
    cast(game, wurm);
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Aphetto Runecaster and Woodcloaker", () => {
  it("turning Woodcloaker face up grants trample to the target and offers Runecaster's draw", () => {
    const { game, a } = table();
    spawn(game, "Aphetto Runecaster");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 7);
    const cloaker = toHand(game, "Woodcloaker");
    cast(game, cloaker, { via: "face-down" } as Partial<Extract<Action, { type: "cast-spell" }>>);
    expect(game.state.objects[cloaker].faceDown).toBeDefined();
    pickTargets(a, bears);
    pickModes(a, 0);
    const before = hand(game).length;
    game.dispatch({ type: "turn-face-up", player: A, permanent: cloaker, morph: true } as Action);
    settle(game);
    expect(game.state.objects[cloaker].faceDown).toBeUndefined();
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Raven Guild Master", () => {
  it("makes the player it deals combat damage to exile the top ten cards of their library", () => {
    const { game, a } = table();
    const master = spawn(game, "Raven Guild Master");
    const library = game.state.zones.perPlayer[B].library.length;
    attack(game, a, [master]);
    expect(life(game, B)).toBe(19);
    expect(game.state.zones.perPlayer[B].library.length).toBe(library - 10);
  });
});

describe("Lingering Death", () => {
  it("makes the enchanted creature's controller sacrifice it at their end step, not at yours", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    attachTo(game, spawn(game, "Lingering Death"), bears);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Claws of Wirewood", () => {
  it("deals 3 damage to each creature with flying and each player", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const drake = spawn(game, "Wind Drake", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Claws of Wirewood"));
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });
});

describe("Trap Digger", () => {
  it("sacrifices only a land with a trap counter to deal 3 damage to an attacking creature", () => {
    const { game, a, b } = table();
    const digger = spawn(game, "Trap Digger");
    const [trapped, plain] = lands(game, "Plains", 4);
    pickTargets(a, trapped);
    activate(game, digger, 0, { targets: [ref(trapped)] });
    expect(counters(game, trapped, "trap")).toBe(1);
    const giant = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    game.advanceUntil(
      (s) => s.turn.number > 1 && s.turn.step === "declare-attackers" && s.priority.holder === A,
    );
    const action = (sacrifice: ObjectId): Action =>
      ({ type: "activate-ability", player: A, source: digger, abilityIndex: 1, targets: [ref(giant)], sacrifice }) as Action;
    expect(game.canDispatch(action(plain))).not.toBeNull();
    game.dispatch(action(trapped));
    settle(game);
    expect(zone(game, trapped)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
