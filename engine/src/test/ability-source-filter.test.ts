/**
 * An ability target narrowed by its source (`{ kind: "ability" }`'s
 * `sourceFilter` and `otherSource`): "target activated or triggered ability
 * you control **from a colorless source**" (Abstruse Archaic) and "… **from
 * another legendary source that's not a commander**" (The Peregrine Dynamo).
 * The source is read as it is, or as it last existed on the battlefield once
 * it has left (rule 113.7a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, hand, lands, ref, settle, spawn, table, zone } from "./harness.js";

/** The ability on top of the stack. */
const topOfStack = (game: Game): ObjectId => {
  const stack = game.state.zones.shared.stack;
  return stack[stack.length - 1];
};

describe("Abstruse Archaic", () => {
  const board = () => {
    const t = table();
    const archaic = spawn(t.game, "Abstruse Archaic");
    lands(t.game, "Island", 10);
    return { ...t, archaic };
  };

  it("copies an ability from a colorless source: Jayemdae Tome draws twice", () => {
    const { game, archaic } = board();
    const tome = spawn(game, "Jayemdae Tome");
    const before = hand(game).length;
    activate(game, tome, 0, { settle: false });
    activate(game, archaic, 0, { targets: [ref(topOfStack(game))] });
    settle(game);
    expect(hand(game).length - before).toBe(2);
  });

  it("can't target an ability from a colored source", () => {
    const { game, archaic } = board();
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    activate(game, sorcerer, 0, { targets: [ref(B)], settle: false });
    expect(() => activate(game, archaic, 0, { targets: [ref(topOfStack(game))] })).toThrow();
  });

  it("reads a source its cost sacrificed as it last was: Mind Stone was colorless", () => {
    const { game, archaic } = board();
    const stone = spawn(game, "Mind Stone");
    const before = hand(game).length;
    activate(game, stone, 1, { settle: false });
    expect(zone(game, stone)).toBe("graveyard");
    activate(game, archaic, 0, { targets: [ref(topOfStack(game))] });
    settle(game);
    expect(hand(game).length - before).toBe(2);
  });
});

describe("The Peregrine Dynamo", () => {
  const board = () => {
    const t = table();
    const dynamo = spawn(t.game, "The Peregrine Dynamo");
    lands(t.game, "Island", 10);
    return { ...t, dynamo };
  };

  it("copies an ability from another legendary source: Arcanis draws six", () => {
    const { game, dynamo } = board();
    const arcanis = spawn(game, "Arcanis the Omnipotent");
    const before = hand(game).length;
    activate(game, arcanis, 0, { settle: false });
    activate(game, dynamo, 0, { targets: [ref(topOfStack(game))] });
    settle(game);
    expect(hand(game).length - before).toBe(6);
  });

  it("can't target an ability from a source that isn't legendary", () => {
    const { game, dynamo } = board();
    const tome = spawn(game, "Jayemdae Tome");
    activate(game, tome, 0, { settle: false });
    expect(() => activate(game, dynamo, 0, { targets: [ref(topOfStack(game))] })).toThrow();
  });

  it("can't target a commander's ability", () => {
    const { game, dynamo } = board();
    const arcanis = spawn(game, "Arcanis the Omnipotent");
    game.state.objects[arcanis].isCommander = true;
    activate(game, arcanis, 0, { settle: false });
    expect(() => activate(game, dynamo, 0, { targets: [ref(topOfStack(game))] })).toThrow();
  });

  it("can't target its own ability: \"another\" source", () => {
    const { game, dynamo } = board();
    const arcanis = spawn(game, "Arcanis the Omnipotent");
    activate(game, arcanis, 0, { settle: false });
    activate(game, dynamo, 0, { targets: [ref(topOfStack(game))], settle: false });
    const own = topOfStack(game);
    expect(game.state.objects[own].sourceObjectId).toBe(dynamo);
    game.state.objects[dynamo].tapped = false;
    expect(() => activate(game, dynamo, 0, { targets: [ref(own)] })).toThrow();
    // A second legendary source's ability is still fine with the Dynamo's
    // own on the stack.
    const below = game.state.zones.shared.stack[0];
    expect(() => activate(game, dynamo, 0, { targets: [ref(below)], settle: false })).not.toThrow();
  });
});
