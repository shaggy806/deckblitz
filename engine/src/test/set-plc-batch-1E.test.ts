import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Planar Chaos batch 1E", () => {
  it("Chronozoa: dying with no time counters makes two copies, each with three time counters", () => {
    const { game } = table();
    const zoa = enter(game, "Chronozoa");
    expect(counters(game, zoa, "time")).toBe(3);
    game.state.objects[zoa].counters.time = 0;
    destroy(game, zoa);
    expect(tokensNamed(game, "Chronozoa", A)).toBe(2);
    for (const id of named(game, "Chronozoa", A)) expect(counters(game, id, "time")).toBe(3);
  });

  it("Chronozoa: dying with a time counter left makes nothing", () => {
    const { game } = table();
    const zoa = enter(game, "Chronozoa");
    destroy(game, zoa);
    expect(tokensNamed(game, "Chronozoa")).toBe(0);
  });

  it("Muck Drubb: a spell aimed at a single creature is redirected to it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    const murder = toHand(game, "Murder");
    pickTargets(a, bears);
    cast(game, murder, { targets: [ref(bears)], settle: false });
    pickTargets(a, murder);
    const drubb = enter(game, "Muck Drubb");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, drubb)).toBe("graveyard");
  });

  it("Phantasmagorian: an opponent discarding three cards counters it", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 7);
    const before = hand(game, B).length;
    pickModes(a);
    pickModes(b, 0);
    const card = toHand(game, "Phantasmagorian");
    cast(game, card);
    expect(zone(game, card)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 3);
  });

  it("Phantasmagorian: nobody discarding lets it resolve; from the graveyard, discard three to return it", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 7);
    pickModes(a);
    pickModes(b);
    const card = toHand(game, "Phantasmagorian");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");

    const dead = toGraveyard(game, "Phantasmagorian");
    const before = hand(game, A).length;
    activate(game, dead, 0);
    expect(zone(game, dead)).toBe("hand");
    expect(hand(game, A).length).toBe(before - 3 + 1);
  });

  it("Intet: pay {2}{U} to exile the top card face down, free to play only while Intet stays", () => {
    const { game, a } = table();
    const intet = spawn(game, "Intet, the Dreamer");
    lands(game, "Island", 3);
    const top = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [intet]);
    settle(game);
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[top].exiledFaceDown?.lookers).toEqual([A]);
    const castable = (): boolean =>
      game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === top);
    // Its three Islands are spent: only the free permission can cast it.
    expect(castable()).toBe(true);
    destroy(game, intet);
    expect(castable()).toBe(false);
    expect(zone(game, top)).toBe("exile");
  });

  it("Numot: pay {2}{R} to destroy up to two target lands", () => {
    const { game, a } = table();
    const numot = spawn(game, "Numot, the Devastator");
    lands(game, "Mountain", 3);
    const [l1, l2, l3] = lands(game, "Plains", 3, B);
    pickTargets(a, l1, l2);
    pickModes(a, 0);
    attack(game, a, [numot]);
    settle(game);
    expect(zone(game, l1)).toBe("graveyard");
    expect(zone(game, l2)).toBe("graveyard");
    expect(zone(game, l3)).toBe("battlefield");
  });

  it("Dormant Sliver: Slivers have defender; an entering Sliver's controller draws", () => {
    const { game } = table();
    const beforeA = hand(game, A).length;
    const dormant = enter(game, "Dormant Sliver");
    expect(hand(game, A).length).toBe(beforeA + 1);
    expect(keywords(game, dormant).has("defender")).toBe(true);
    const beforeB = hand(game, B).length;
    // Alice's Dormant Sliver reaches Bob's Sliver too, and Bob draws.
    const other = enter(game, "Muscle Sliver", B);
    expect(hand(game, B).length).toBe(beforeB + 1);
    expect(keywords(game, other).has("defender")).toBe(true);
  });

  it("Deadwood Treefolk: leaving returns another creature card, never itself", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    const tree = enter(game, "Deadwood Treefolk");
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, tree, "time")).toBe(3);
    const elves = toGraveyard(game, "Llanowar Elves");
    let offered: readonly string[] = [];
    a.chooseTargetsFn = (_v, _n, _s, options) => {
      offered = options[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [{ kind: "object", object: elves }];
    };
    destroy(game, tree);
    expect(offered).not.toContain(tree);
    expect(zone(game, elves)).toBe("hand");
  });

  it("Keldon Marauders: 1 damage as it enters and as it leaves", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const keldon = enter(game, "Keldon Marauders");
    expect(life(game, B)).toBe(19);
    expect(counters(game, keldon, "time")).toBe(2);
    destroy(game, keldon);
    expect(life(game, B)).toBe(18);
  });

  it("Pouncing Wurm: kicked, three +1/+1 counters and haste; unkicked, neither", () => {
    const { game } = table();
    lands(game, "Forest", 11);
    const kicked = toHand(game, "Pouncing Wurm");
    cast(game, kicked, { kicked: true });
    expect(pt(game, kicked)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, kicked).has("haste")).toBe(true);
    const plain = toHand(game, "Pouncing Wurm");
    cast(game, plain);
    expect(pt(game, plain)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, plain).has("haste")).toBe(false);
  });

  it("Lavacore Elemental: another creature's combat damage to a player adds a time counter", () => {
    const { game, a } = table();
    const lava = enter(game, "Lavacore Elemental");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    settle(game);
    expect(counters(game, lava, "time")).toBe(2);
  });

  it("Ghost Tactician: {W}, {T}, discard a card pumps your creatures +1/+0", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const ghost = spawn(game, "Ghost Tactician");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    activate(game, ghost, 0);
    expect(hand(game, A).length).toBe(before - 1);
    expect(graveyard(game, A).length).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, ghost)).toEqual({ power: 3, toughness: 5 });
  });
});
