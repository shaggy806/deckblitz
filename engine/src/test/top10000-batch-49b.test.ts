/**
 * Card batch 49, part b (2026-10-11): ranks 6842–6865. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Generator Servant", () => {
  it("adds {C}{C}, and a creature spell paid with it gains haste", () => {
    const { game } = table();
    const servant = spawn(game, "Generator Servant");
    activate(game, servant, 0);
    expect(zone(game, servant)).toBe("graveyard");
    expect(game.state.players[A].manaPool.filter((u) => u.type === "C")).toHaveLength(2);
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("gives no haste to a creature paid for without its mana", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });
});

describe("Earthshape", () => {
  it("earthbends 3, then protects only creatures with power up to the land's, and gives you hexproof", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const forest = spawn(game, "Forest");
    const giant = spawn(game, "Hill Giant"); // 3/3: equal to the land's 3
    const wurm = spawn(game, "Craw Wurm"); // 6/4: greater
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Earthshape"), { targets: [ref(forest)] });
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
    for (const id of [forest, giant]) {
      expect(keywords(game, id).has("hexproof")).toBe(true);
      expect(keywords(game, id).has("indestructible")).toBe(true);
    }
    expect(keywords(game, wurm).has("hexproof")).toBe(false);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
    expect(game.state.hexproofPlayers).toContain(A);
  });
});

describe("The Prydwen, Steel Flagship", () => {
  it("makes a Knight for another nontoken artifact, 4/4 for the rest of the turn the artifact entered", () => {
    const { game } = table();
    spawn(game, "The Prydwen, Steel Flagship");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Human Knight Token (The Prydwen)")).toBe(0);
    const ring = enter(game, "Sol Ring");
    expect(tokensNamed(game, "Human Knight Token (The Prydwen)")).toBe(1);
    const knight = game.battlefield.find((id) => game.state.objects[id].cardName === "Human Knight Token (The Prydwen)")!;
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 4 });
    // The artifact leaving doesn't undo it (the ruling).
    destroy(game, ring);
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Mystifying Maze", () => {
  it("exiles an opponent's attacker and returns it tapped at the next end step", () => {
    const { game, b } = table();
    const maze = spawn(game, "Mystifying Maze");
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game); // bob's turn
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    activate(game, maze, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, A)).toBe(20);
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length === 0 && s.priority.holder !== null);
    settle(game);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(game.state.objects[back!].tapped).toBe(true);
    expect(game.state.objects[back!].controller).toBe(B);
  });
});

describe("Breathe Your Last", () => {
  it("destroys the creature and gains 1 life per color it had", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const wolf = spawn(game, "Watchwolf", B); // green and white
    cast(game, toHand(game, "Breathe Your Last"), { targets: [ref(wolf)] });
    expect(zone(game, wolf)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
  });
});

describe("Prismatic Undercurrents", () => {
  it("searches for up to X basic lands, X the colors among permanents you control", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears"); // green, like the enchantment: still one color
    spawn(game, "Watchwolf", B); // an opponent's colors don't count
    spawn(game, "Ornithopter"); // colorless
    const library = [toLibrary(game, "Island"), toLibrary(game, "Plains")];
    let max = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, m) => {
      max = m;
      return eligible.filter((id) => library.includes(id)).slice(0, m);
    };
    enter(game, "Prismatic Undercurrents");
    expect(max).toBe(1);
    expect(library.filter((id) => zone(game, id) === "hand")).toHaveLength(1);
  });

  it("counts two colors as two", () => {
    const { game, a } = table();
    spawn(game, "Watchwolf"); // green and white
    let max = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, m) => {
      max = m;
      return eligible.slice(0, m);
    };
    enter(game, "Prismatic Undercurrents");
    expect(max).toBe(2);
  });
});
