/**
 * Twinning Staff — "if you would copy a spell one or more times, instead copy
 * it that many times plus an additional time. You may choose new targets for
 * the additional copy" (`would-copy-spell`, rule 614.1a): one instruction to
 * copy, however many it makes, and the additional copy placed among those that
 * couldn't take new targets (the rulings).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  cast,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
} from "./harness.js";

const copies = (game: Game): number => game.eventsOfType("spell-copied").length;
/** The object targets of the spells on the stack, bottom to top. */
const stackTargets = (game: Game) =>
  game.state.zones.shared.stack
    .map((id) => game.state.objects[id])
    .filter((o) => o.kind === "card")
    .map((o) => o.targets?.flatMap((t) => (t?.kind === "object" ? [t.object] : [])));

describe("Twinning Staff", () => {
  it("adds one copy to a Twincast, with new targets for each and nothing to place", () => {
    const { game, a } = table();
    spawn(game, "Twinning Staff");
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const seen = watchTargets(a, () => [A]);
    a.chooseNumberFn = () => {
      throw new Error("nothing to place: every copy could take new targets");
    };
    cast(game, toHand(game, "Twincast"), { targets: [ref(bolt)] });
    expect(copies(game)).toBe(2);
    expect(seen.asked).toBe(2);
    expect(life(game, A)).toBe(14);
    expect(life(game, B)).toBe(17);
  });

  it("adds one each with two of them, and one to a second instruction too", () => {
    const { game, a } = table();
    spawn(game, "Twinning Staff");
    spawn(game, "Twinning Staff");
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    watchTargets(a, () => [B]);
    cast(game, toHand(game, "Twincast"), { targets: [ref(bolt)] });
    expect(copies(game)).toBe(3);
    expect(life(game, B)).toBe(8);
  });

  it("is its controller's alone: the copier's own Staff counts, an opponent's doesn't", () => {
    const { game, a, b } = table();
    spawn(game, "Twinning Staff", B);
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    watchTargets(a, () => [B]);
    cast(game, toHand(game, "Twincast"), { targets: [ref(bolt)], settle: false });
    // Alice's Twincast, Bob's Staff: no additional copy.
    settle(game);
    expect(copies(game)).toBe(1);

    lands(game, "Island", 2, B);
    lands(game, "Mountain", 1);
    const second = toHand(game, "Lightning Bolt");
    cast(game, second, { targets: [ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    watchTargets(b, () => [A]);
    cast(game, toHand(game, "Twincast", B), { player: B, targets: [ref(second)] });
    // Bob copies Alice's spell, with his own Staff: two copies, both his.
    expect(copies(game)).toBe(3);
    expect(life(game, A)).toBe(14);
  });

  it("adds one to storm's copies, and none when there are none to make", () => {
    const { game, a } = table();
    spawn(game, "Twinning Staff");
    lands(game, "Mountain", 4);
    watchTargets(a, () => [B]);
    cast(game, toHand(game, "Grapeshot"), { targets: [ref(B)] });
    // Storm count 0: nothing would be copied, so nothing's added.
    expect(copies(game)).toBe(0);
    expect(life(game, B)).toBe(19);
    cast(game, toHand(game, "Grapeshot"), { targets: [ref(B)] });
    // One spell before it: its one copy, the additional one, and it.
    expect(copies(game)).toBe(2);
    expect(life(game, B)).toBe(16);
  });

  it("adds a copy to a copy of a permanent spell, with the copy's exception", () => {
    const { game } = table();
    spawn(game, "Twinning Staff");
    lands(game, "Plains", 1);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const legend = toHand(game, "Isamaru, Hound of Konda");
    cast(game, legend, { settle: false });
    cast(game, toHand(game, "Double Major"), { targets: [ref(legend)] });
    // The card and two tokens, the tokens not legendary: no legend rule.
    expect(tokensNamed(game, "Isamaru, Hound of Konda", A)).toBe(2);
    const tokens = named(game, "Isamaru, Hound of Konda", A).filter((id) => game.state.objects[id].isToken);
    for (const token of tokens) expect(supertypes(game, token)).not.toContain("legendary");
  });

  it("doesn't touch a copy of an ability", () => {
    const { game } = table();
    spawn(game, "Twinning Staff");
    const solidarity = spawn(game, "Renewed Solidarity");
    game.state.objects[solidarity].chosenCreatureType = "Goblin";
    const resonator = spawn(game, "Strionic Resonator");
    lands(game, "Wastes", 2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 });
    toStep(game, "end");
    const trigger = game.state.zones.shared.stack[game.state.zones.shared.stack.length - 1];
    activate(game, resonator, 0, { targets: [ref(trigger)] });
    settle(game);
    // Doubled by the copy, doubled by the trigger: never three times over.
    expect(tokensNamed(game, "Goblin Token", A)).toBe(4);
    expect(copies(game)).toBe(0);
  });

  it("copies with {7}, {T}: the instruction and its additional copy", () => {
    const { game, a } = table();
    const staff = spawn(game, "Twinning Staff");
    lands(game, "Wastes", 7);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    watchTargets(a, () => [B]);
    activate(game, staff, 0, { targets: [ref(bolt)] });
    settle(game);
    expect(copies(game)).toBe(2);
    expect(life(game, B)).toBe(11);
  });
});

describe("the additional copy of an aimed copy", () => {
  /** Zada with `bears` others, each copy aimed by the effect, and a Staff. */
  const withZada = (bears: number) => {
    const t = table();
    spawn(t.game, "Twinning Staff");
    lands(t.game, "Forest", 1);
    const zada = spawn(t.game, "Zada, Hedron Grinder");
    const others: ObjectId[] = [];
    for (let i = 0; i < bears; i += 1) others.push(spawn(t.game, "Grizzly Bears"));
    return { ...t, zada, others };
  };

  it("has the spell's own targets unless they choose new ones, and is placed among Zada's copies", () => {
    const { game, a, zada, others } = withZada(2);
    const [first, second] = others;
    pickPermanents(a, second, first);
    // Kept: the additional copy aims at Zada, as Giant Growth does.
    watchTargets(a, () => [zada]);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(zada)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number");
    expect(copies(game)).toBe(3);
    // Bottom to top: Giant Growth, the copy for the second Bear, for the
    // first, and the additional copy, to be placed.
    expect(stackTargets(game)).toEqual([[zada], [second], [first], [zada]]);
    const offer = game.state.awaiting;
    expect(offer).toMatchObject({ kind: "choose-number", player: A, min: 0, max: 2 });
    game.dispatch({ type: "choose-number", player: A, number: 1 });
    // Under one of them: it resolves second.
    expect(stackTargets(game)).toEqual([[zada], [second], [zada], [first]]);
    settle(game);
    expect(pt(game, zada)).toEqual({ power: 9, toughness: 9 });
    expect(pt(game, first)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, second)).toEqual({ power: 5, toughness: 5 });
  });

  it("can go under all of them or stay over them all, and no further", () => {
    for (const [answer, expected] of [
      [0, "top"],
      [2, "bottom"],
    ] as const) {
      const { game, a, zada, others } = withZada(2);
      const [first, second] = others;
      pickPermanents(a, second, first);
      watchTargets(a, () => [zada]);
      cast(game, toHand(game, "Giant Growth"), { targets: [ref(zada)], settle: false });
      game.advanceUntil((s) => s.awaiting?.kind === "choose-number");
      game.dispatch({ type: "choose-number", player: A, number: answer });
      expect(stackTargets(game)).toEqual(
        expected === "top" ? [[zada], [second], [first], [zada]] : [[zada], [zada], [second], [first]],
      );
    }
    const { game, a, zada, others } = withZada(2);
    pickPermanents(a, others[1], others[0]);
    watchTargets(a, () => [zada]);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(zada)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number");
    expect(() => game.dispatch({ type: "choose-number", player: A, number: 3 })).toThrow();
  });

  it("asks nothing when it has the same targets as every other copy", () => {
    const { game, a, zada, others } = withZada(1);
    const [bear] = others;
    a.chooseNumberFn = () => {
      throw new Error("the same wherever it goes");
    };
    // Its new target is the one Zada's copy has.
    watchTargets(a, () => [bear]);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(zada)] });
    expect(copies(game)).toBe(2);
    expect(pt(game, bear)).toEqual({ power: 8, toughness: 8 });
  });

  it("places a second additional copy among the first too", () => {
    const { game, a, zada, others } = withZada(1);
    spawn(game, "Twinning Staff");
    const [bear] = others;
    watchTargets(a, () => [zada]);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(zada)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number");
    expect(game.state.awaiting).toMatchObject({ max: 1 });
    game.dispatch({ type: "choose-number", player: A, number: 1 });
    expect(game.state.awaiting).toMatchObject({ kind: "choose-number", max: 2 });
    game.dispatch({ type: "choose-number", player: A, number: 2 });
    // Giant Growth; the second additional copy, under both; the first, under
    // Zada's; then Zada's on top.
    expect(stackTargets(game)).toEqual([[zada], [zada], [zada], [bear]]);
    settle(game);
    expect(copies(game)).toBe(3);
  });

  it("isn't made when the aimed copy can't be: nothing would be copied", () => {
    const { game, zada } = withZada(0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(zada)] });
    expect(copies(game)).toBe(0);
    expect(pt(game, zada)).toEqual({ power: 6, toughness: 6 });
  });

  it("leaves Ivy's copy aimed at Ivy, and the additional one the spell's unless changed", () => {
    const { game, a } = table();
    spawn(game, "Twinning Staff");
    lands(game, "Forest", 1);
    const ivy = spawn(game, "Ivy, Gleeful Spellthief");
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = watchTargets(a, (offered) => [offered[0].includes(bear) ? bear : null]);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number" || s.zones.shared.stack.length === 0);
    expect(seen.asked).toBe(1);
    expect(copies(game)).toBe(2);
    // The additional copy keeps the Bear, unlike Ivy's copy: so it's placed.
    expect(game.state.awaiting).toMatchObject({ kind: "choose-number", max: 1 });
    game.dispatch({ type: "choose-number", player: A, number: 0 });
    settle(game);
    expect(pt(game, ivy)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, bear)).toEqual({ power: 8, toughness: 8 });
  });
});
