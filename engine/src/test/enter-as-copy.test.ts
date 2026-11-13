/**
 * "Enter as a copy of …" from outside the entering permanent
 * (`OthersEnterReplacement.asCopyOf`, `Game.enterAsCopyAsked`): a copy effect
 * applied as it enters (rules 614.1c, 707.9), before its own replacements and
 * "as this enters" choices. Mystic Reflection's resolved "next time" shield
 * (spent by one whole event, the target read as it last existed if it has
 * left) and Essence of the Wild's static.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, lands, nextTurn, ref, settle, spawn, table, toHand, zone } from "./harness.js";
import { printedCardName } from "../state.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const named = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const pt = (game: Game, id: ObjectId): [number, number] => {
  const c = game.characteristics(id);
  return [c.power ?? 0, c.toughness ?? 0];
};

/** Mystic Reflection resolved on `target`, with mana for what comes after. */
const reflected = (game: Game, target: ObjectId, mana = 3): void => {
  lands(game, "Island", 2 + mana);
  lands(game, "Forest", mana);
  lands(game, "Plains", mana);
  cast(game, toHand(game, "Mystic Reflection"), { targets: [ref(target)] });
};

describe("Mystic Reflection", () => {
  it("the next creature to enter this turn enters as a copy of the chosen one; the one after doesn't", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    reflected(game, bear);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(zone(game, elves)).toBe("battlefield");
    expect(named(game, elves)).toBe("Grizzly Bears");
    expect(pt(game, elves)).toEqual([2, 2]);
    const second = toHand(game, "Llanowar Elves");
    cast(game, second);
    expect(named(game, second)).toBe("Llanowar Elves");
  });

  it("everything entering in that one event is a copy, then it's spent", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    reflected(game, bear);
    cast(game, toHand(game, "Raise the Alarm"));
    const tokens = game.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].controller === A);
    const count = tokens.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(count).toBe(2);
    for (const id of tokens) expect(named(game, id)).toBe("Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(named(game, elves)).toBe("Llanowar Elves");
  });

  it("copies the chosen creature as it last existed if it has left", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    reflected(game, bear);
    destroy(game, bear);
    expect(zone(game, bear)).toBe("graveyard");
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(named(game, elves)).toBe("Grizzly Bears");
  });

  it("a Clone entering under it asks nothing and is a copy of the chosen creature", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    spawn(game, "Serra Angel", A);
    reflected(game, bear);
    const clone = toHand(game, "Clone");
    cast(game, clone, { settle: false });
    settle(game);
    expect(zone(game, clone)).toBe("battlefield");
    expect(named(game, clone)).toBe("Grizzly Bears");
  });

  it("a land entering doesn't spend it", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    reflected(game, bear);
    const forest = toHand(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(named(game, forest)).toBe("Forest");
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(named(game, elves)).toBe("Grizzly Bears");
  });

  it("ends with the turn", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    reflected(game, bear);
    expect(game.state.activeReplacements.some((r) => r.replacement.event === "others-enter-battlefield")).toBe(true);
    nextTurn(game);
    expect(game.state.activeReplacements.some((r) => r.replacement.event === "others-enter-battlefield")).toBe(false);
  });
});

describe("Essence of the Wild", () => {
  it("creatures you control enter as a copy of it; an opponent's don't", () => {
    const { game } = table();
    spawn(game, "Essence of the Wild", A);
    lands(game, "Forest", 4);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(named(game, elves)).toBe("Essence of the Wild");
    expect(pt(game, elves)).toEqual([6, 6]);
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(named(game, theirs)).toBe("Grizzly Bears");
  });

  it("the entering creature's own enters trigger doesn't happen: it's Essence of the Wild", () => {
    const { game } = table();
    spawn(game, "Essence of the Wild", A);
    lands(game, "Forest", 4);
    const before = game.state.zones.perPlayer[A].hand.length;
    const visionary = toHand(game, "Elvish Visionary");
    cast(game, visionary);
    expect(named(game, visionary)).toBe("Essence of the Wild");
    // Cast from hand (one fewer), no card drawn.
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before);
  });

  it("with Mystic Reflection too, the entering player orders them and the last applied wins", () => {
    const { game } = table();
    spawn(game, "Essence of the Wild", A);
    const bear = spawn(game, "Grizzly Bears", B);
    reflected(game, bear);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "replacement-order" || s.zones.shared.stack.length === 0);
    const asked = game.state.awaiting;
    expect(asked?.kind).toBe("replacement-order");
    if (asked?.kind !== "replacement-order") return;
    // Essence of the Wild's applies first: Mystic Reflection's is last.
    const essenceFirst = asked.options.findIndex((o) => o.name === "Essence of the Wild");
    game.dispatch({ type: "replacement-order", player: A, option: essenceFirst });
    settle(game);
    expect(named(game, elves)).toBe("Grizzly Bears");
  });
});

describe("tokens under an enter-as-copy effect", () => {
  it("tokens made under Essence of the Wild are copies of it, and what made them still gets them back", () => {
    const { game } = table();
    spawn(game, "Essence of the Wild", A);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    const tokens = game.battlefield.filter((id) => game.state.objects[id].isToken);
    expect(tokens.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
    for (const id of tokens) {
      expect(named(game, id)).toBe("Essence of the Wild");
      expect(pt(game, id)).toEqual([6, 6]);
    }
  });
});
