/**
 * Only a creature dies (rule 700.4). The `dies` trigger is any trip from the battlefield to a
 * graveyard — "is put into a graveyard from the battlefield" cards use it as written — so a card
 * whose text says "dies" carries `type: "creature"` in its filter: a noncreature changeling
 * (Firdoch Core, a Kindred artifact Shapeshifter) going there is an Angel, but didn't die.
 */
import { describe, expect, it } from "vitest";

import { A, destroy, hand, life, ref, spawn, table, toStep } from "./harness.js";

describe("dies (rule 700.4)", () => {
  it("'whenever an Angel you control dies' ignores a noncreature changeling put into a graveyard", () => {
    const { game } = table();
    spawn(game, "Bishop of Wings");
    const core = spawn(game, "Firdoch Core");
    const angel = spawn(game, "Serra Angel");
    const spirits = (): number =>
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Spirit Token").length;
    destroy(game, core);
    toStep(game, "postcombat-main");
    expect(spirits()).toBe(0);
    destroy(game, angel);
    toStep(game, "end");
    expect(spirits()).toBe(1);
  });
});

describe("Laid to Rest", () => {
  it("draws for a Human that dies and gains 2 for a creature with a +1/+1 counter that dies", () => {
    const { game } = table();
    spawn(game, "Laid to Rest");
    // A Human with no counter: a card, no life. A non-Human with one: life, no card.
    const bears = spawn(game, "Grizzly Bears");
    const knight = spawn(game, "Benalish Knight");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    const before = hand(game).length;
    destroy(game, knight);
    toStep(game, "postcombat-main");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(20);
    destroy(game, bears);
    toStep(game, "end");
    expect(life(game, A)).toBe(22);
  });
});
