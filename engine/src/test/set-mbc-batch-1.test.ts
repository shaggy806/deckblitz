// Batch 269 — the lead's cards beside the agent's group (set-mbc-batch-1a):
// the scaffolder-finished drafts from Marvel: Darkhold Destiny's previews and
// Mystery Booster Commander Edition, each read against its Oracle text.
import { describe, expect, it } from "vitest";
import { poolCounts } from "../mana.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, enter, life, loyalty, ref, spawn, table, tokensNamed, toHand } from "./harness.js";

const faceDown = (game: Game): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "battlefield" && o.faceDown !== undefined)
    .map((o) => o.id);

const pool = (game: Game) => poolCounts(game.state.players[A].manaPool);

/** Attack B with `attacker` and list which of B's creatures may block it. */
const blockersFor = (game: Game, a: { declareAttackersFn?: unknown }, attacker: ObjectId): ObjectId[] => {
  (a as { declareAttackersFn: () => unknown }).declareAttackersFn = () => [{ attacker, defender: B }];
  game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.result.over);
  const legal = game.legalActions(B).find((x) => x.kind === "declare-blockers");
  if (legal === undefined || legal.kind !== "declare-blockers") return [];
  return legal.eligible.filter((e) => e.canBlock.includes(attacker)).map((e) => e.blocker);
};

describe("Davvol, Evincar of Rath", () => {
  it("another creature entering costs 1 life and adds {B}; Davvol itself doesn't", () => {
    const { game } = table();
    enter(game, "Davvol, Evincar of Rath");
    expect(life(game)).toBe(20);
    enter(game, "Grizzly Bears");
    expect(life(game)).toBe(19);
    expect(pool(game).B).toBe(1);
    enter(game, "Grizzly Bears", B);
    expect(life(game)).toBe(19);
  });
});

describe("Autumn Willow, Harmony", () => {
  it("makes a Forest Dryad, and a land creature tapped for mana adds an extra {G}", () => {
    const { game } = table();
    enter(game, "Autumn Willow, Harmony");
    expect(tokensNamed(game, "Forest Dryad Token", A)).toBe(1);
    const dryad = spawn(game, "Forest Dryad Token");
    activate(game, dryad, 0);
    expect(pool(game).G).toBe(2);
  });

  it("adds nothing for a land that isn't a creature", () => {
    const { game } = table();
    spawn(game, "Autumn Willow, Harmony");
    const forest = spawn(game, "Forest");
    activate(game, forest, 0);
    expect(pool(game).G).toBe(1);
  });
});

describe("Dyfed, the Guiding Hand", () => {
  it("−X untaps X target artifacts", () => {
    const { game } = table();
    const dyfed = spawn(game, "Dyfed, the Guiding Hand");
    const rocks = [spawn(game, "Sol Ring", A, { tapped: true }), spawn(game, "Sol Ring", A, { tapped: true })];
    loyalty(game, dyfed, "-x", { x: 2, targets: rocks.map(ref) });
    for (const r of rocks) expect(game.state.objects[r].tapped).toBe(false);
    expect(game.state.objects[dyfed].counters.loyalty).toBe(2);
  });

  it("+1 makes two tapped Powerstones", () => {
    const { game } = table();
    const dyfed = spawn(game, "Dyfed, the Guiding Hand");
    loyalty(game, dyfed, 1);
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(2);
  });
});

describe("Sash and Waistcoat, Unmen", () => {
  it("{3}: manifests the top card of the activator's library", () => {
    const { game } = table();
    const sash = spawn(game, "Sash and Waistcoat, Unmen");
    for (let i = 0; i < 3; i++) spawn(game, "Wastes");
    activate(game, sash, 0);
    expect(faceDown(game).map((id) => game.state.objects[id].controller)).toEqual([A]);
  });

  it("a face-down creature attacking an opponent can't be blocked", () => {
    const { game, a } = table();
    const sash = spawn(game, "Sash and Waistcoat, Unmen");
    for (let i = 0; i < 3; i++) spawn(game, "Wastes");
    activate(game, sash, 0);
    const [manifested] = faceDown(game);
    game.state.objects[manifested].summoningSick = false;
    spawn(game, "Grizzly Bears", B);
    expect(blockersFor(game, a, manifested)).toEqual([]);
  });

  it("a face-up attacker can still be blocked", () => {
    const { game, a } = table();
    spawn(game, "Sash and Waistcoat, Unmen");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    expect(blockersFor(game, a, bears)).toEqual([blocker]);
  });
});

describe("Temple of Khonshu", () => {
  it("enters tapped without a Dimension", () => {
    const { game } = table();
    const temple = toHand(game, "Temple of Khonshu");
    game.dispatch({ type: "play-land", player: A, card: temple });
    expect(game.state.objects[temple].tapped).toBe(true);
  });
});

describe("Penance Stare", () => {
  it("can't target a creature that isn't attacking", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const stare = toHand(game, "Penance Stare");
    spawn(game, "Plains");
    expect(() => game.dispatch({ type: "cast-spell", player: A, card: stare, targets: [ref(bears)] })).toThrow();
  });
});
