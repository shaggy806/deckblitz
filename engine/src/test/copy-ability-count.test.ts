/**
 * `copy-ability`'s `count` ("copy target activated or triggered ability you
 * control X times" — Gogo, Master of Mimicry) and "this ability / spell
 * can't be copied" (`ActivatedAbility.cantBeCopied`, `CardDefinition
 * .cantBeCopied` — Gogo, See Double): a copy effect aimed at one makes
 * nothing (rule 707.10), though it's still a legal target.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, B, activate, cast, hand, lands, life, pickTargets, ref, settle, spawn, table, toGraveyard, toHand } from "./harness.js";

/** The ability on top of the stack. */
const topOfStack = (game: Game): ObjectId => {
  const stack = game.state.zones.shared.stack;
  return stack[stack.length - 1];
};

describe("Gogo, Master of Mimicry", () => {
  const board = () => {
    const t = table();
    const gogo = spawn(t.game, "Gogo, Master of Mimicry");
    const tome = spawn(t.game, "Jayemdae Tome");
    lands(t.game, "Island", 12);
    return { ...t, gogo, tome };
  };

  it("copies the ability X times: the Tome's draw happens X + 1 times", () => {
    const { game, gogo, tome } = board();
    const before = hand(game).length;
    activate(game, tome, 0, { settle: false });
    const tomeAbility = topOfStack(game);
    activate(game, gogo, 0, { x: 2, targets: [ref(tomeAbility)] });
    settle(game);
    expect(hand(game).length - before).toBe(3);
  });

  it("refuses X = 0", () => {
    const { game, gogo, tome } = board();
    activate(game, tome, 0, { settle: false });
    const tomeAbility = topOfStack(game);
    expect(() => activate(game, gogo, 0, { x: 0, targets: [ref(tomeAbility)] })).toThrow(/X|at least/i);
  });

  it("its ability can't be copied: Lithoform Engine copying it makes nothing", () => {
    const { game, gogo, tome } = board();
    const engine = spawn(game, "Lithoform Engine");
    const before = hand(game).length;
    activate(game, tome, 0, { settle: false });
    const tomeAbility = topOfStack(game);
    activate(game, gogo, 0, { x: 1, targets: [ref(tomeAbility)], settle: false });
    const gogoAbility = topOfStack(game);
    // Still a legal target; resolving, it copies nothing.
    activate(game, engine, 0, { targets: [ref(gogoAbility)], settle: false });
    const stackBefore = game.state.zones.shared.stack.length;
    settle(game);
    // The Tome's ability and one copy of it: two draws, not three.
    expect(hand(game).length - before).toBe(2);
    expect(stackBefore).toBe(3);
  });
});

describe("See Double — this spell can't be copied", () => {
  it("copies a spell, and a copy effect aimed at See Double itself makes nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 9);
    lands(game, "Mountain", 1);
    const engine = spawn(game, "Lithoform Engine");
    const bolt = toHand(game, "Lightning Bolt");
    const see = toHand(game, "See Double");
    pickTargets(a, B);
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const boltSpell = bolt;
    cast(game, see, { modes: [0], targets: [ref(boltSpell)], settle: false });
    // Lithoform Engine's "copy target instant or sorcery spell you control".
    activate(game, engine, 1, { targets: [ref(see)], settle: false });
    settle(game);
    // The Bolt and one copy of it: 6, not the 9 a copied See Double would make.
    expect(life(game, B)).toBe(14);
  });

  it("chooses both modes while an opponent has eight cards in their graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    for (let i = 0; i < 8; i += 1) toGraveyard(game, "Wastes", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    pickTargets(a, B);
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "See Double"), { modes: [0, 1], targets: [ref(bolt), ref(bears)] });
    expect(life(game, B)).toBe(14);
    const mine = game.battlefield.filter(
      (id) => game.state.objects[id].controller === A && nameOf(game.state.objects[id]) === "Grizzly Bears",
    );
    expect(mine).toHaveLength(1);
  });

  it("chooses only one mode otherwise", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    expect(game.canDispatch({
      type: "cast-spell", player: A, card: toHand(game, "See Double"), modes: [0, 1], targets: [ref(bolt), ref(bears)],
    })).toMatch(/mode/i);
  });
});
