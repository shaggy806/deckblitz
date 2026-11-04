/**
 * "You may … Do this only once each turn": the `may`'s `oncePerTurn` limits the
 * doing, not the trigger — Ondu Spiritdancer. Declining leaves it for the turn's
 * next enchantment; a token made stops the token's own entry and every other
 * instance on the stack offering (the rulings).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, enter, lands, nextTurn, ref, settle, spawn, table, toHand } from "./harness.js";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";

const copies = (game: Game, name: string): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === name && game.state.objects[id].isToken === true,
  );

/** Alice answers each "may" with `yes`, counting the askings. */
function counting(seat: ReturnType<typeof table>["a"], yes: (asked: number) => boolean = () => true): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseModesFn = () => {
    seen.asked += 1;
    return yes(seen.asked) ? [0] : [];
  };
  return seen;
}

describe("Ondu Spiritdancer", () => {
  it("copies an enchantment entering under you, once, its token's entry offering nothing", () => {
    const { game, a } = table();
    spawn(game, "Ondu Spiritdancer");
    const seen = counting(a);
    enter(game, "Glorious Anthem");
    expect(seen.asked).toBe(1);
    expect(copies(game, "Glorious Anthem").length).toBe(1);
  });

  it("declined, it's still there for the next enchantment; taken, the next is offered nothing", () => {
    const { game, a } = table();
    spawn(game, "Ondu Spiritdancer");
    const seen = counting(a, (asked) => asked > 1);
    enter(game, "Glorious Anthem");
    expect(seen.asked).toBe(1);
    expect(copies(game, "Glorious Anthem").length).toBe(0);
    enter(game, "Honor of the Pure");
    expect(seen.asked).toBe(2);
    expect(copies(game, "Honor of the Pure").length).toBe(1);
    enter(game, "Bad Moon");
    expect(seen.asked).toBe(2);
    expect(copies(game, "Bad Moon").length).toBe(0);
  });

  it("comes back the next turn", () => {
    const { game, a } = table();
    spawn(game, "Ondu Spiritdancer");
    counting(a);
    enter(game, "Glorious Anthem");
    expect(copies(game, "Glorious Anthem").length).toBe(1);
    nextTurn(game);
    enter(game, "Honor of the Pure");
    expect(copies(game, "Honor of the Pure").length).toBe(1);
  });

  it("two instances on the stack: one copy, for only one of them", () => {
    const { game, a } = table();
    spawn(game, "Ondu Spiritdancer");
    const seen = counting(a);
    enter(game, "Glorious Anthem", A, { settle: false });
    enter(game, "Honor of the Pure", A, { settle: false });
    settle(game);
    expect(seen.asked).toBe(1);
    expect(copies(game, "Glorious Anthem").length + copies(game, "Honor of the Pure").length).toBe(1);
  });

  it("an opponent's enchantment doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Ondu Spiritdancer");
    const seen = counting(a);
    enter(game, "Glorious Anthem", B);
    expect(seen.asked).toBe(0);
  });

  it("an Aura's token chooses what it enchants as it enters (rule 303.4f)", () => {
    const { game, a } = table();
    spawn(game, "Ondu Spiritdancer");
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    counting(a);
    a.chooseEnchantFn = (_view, _source, options) => {
      expect(options).toEqual(expect.arrayContaining([bears, angel]));
      return angel;
    };
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Pacifism"), { targets: [ref(bears)] });
    const [token] = copies(game, "Pacifism");
    expect(game.state.objects[token].attachedTo).toBe(angel);
  });
});
