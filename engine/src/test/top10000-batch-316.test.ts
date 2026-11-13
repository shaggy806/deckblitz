// Batch 316: the top 5000's next ten (EDHREC 3596–3964), each on the feature
// it needed.

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  life,
  lands,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("The Masamune: the equipped creature's death triggers twice", () => {
  const equipped = () => {
    const { game } = table();
    const cutthroat = spawn(game, "Zulaport Cutthroat");
    spawn(game, "Cruel Celebrant");
    const sword = spawn(game, "The Masamune");
    lands(game, "Wastes", 2);
    activate(game, sword, 0, { targets: [ref(cutthroat)] });
    return { game, cutthroat };
  };

  it("doubles the equipped creature's trigger, not another permanent's", () => {
    const { game } = equipped();
    destroy(game, spawn(game, "Grizzly Bears"));
    // Zulaport twice, Cruel Celebrant once.
    expect(life(game, B)).toBe(17);
  });

  it("the equipped creature's own death still triggers twice", () => {
    const { game, cutthroat } = equipped();
    destroy(game, cutthroat);
    expect(life(game, B)).toBe(17);
  });

  it("doubles an emblem its controller owns", () => {
    const { game } = equipped();
    const source = spawn(game, "Wastes");
    const emblem: EffectSpec = {
      kind: "create-emblem",
      text: "test emblem",
      triggered: [
        {
          trigger: { on: "dies", who: "any", filter: { type: "creature" } },
          targets: [],
          effect: { kind: "lose-life", who: "each-opponent", amount: 1 },
          resolve: null,
          text: "Whenever a creature dies, each opponent loses 1 life.",
        },
      ],
    };
    game.debugApplyEffect(A, emblem, [], { source });
    settle(game);
    destroy(game, spawn(game, "Grizzly Bears", B));
    // Bob's Bears: the emblem twice (Zulaport and the Celebrant see only
    // Alice's creatures).
    expect(life(game, B)).toBe(18);
  });
});

describe("Victory Chimes: a player of your choice adds {C}", () => {
  it("is offered once per player, and the one named gets the mana", () => {
    const { game } = table();
    const chimes = spawn(game, "Victory Chimes");
    const offers = game
      .legalActions(A)
      .filter((a) => a.kind === "activate-ability" && a.source === chimes)
      .map((a) => (a.kind === "activate-ability" ? a.manaFor : undefined));
    expect(offers).toEqual([A, B]);
    game.dispatch({ type: "activate-ability", player: A, source: chimes, abilityIndex: 0, targets: [], manaFor: B });
    expect(game.state.players[B].manaPool.map((u) => u.type)).toEqual(["C"]);
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("pays its controller's own cost", () => {
    const { game } = table();
    spawn(game, "Victory Chimes");
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Transmute Artifact: pay the difference or lose the find", () => {
  const setup = (mana: number) => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const stone = toLibrary(game, "Mind Stone");
    lands(game, "Island", 2 + mana);
    const spell = toHand(game, "Transmute Artifact");
    pickFromZone(a, stone);
    return { game, a, ring, stone, spell };
  };

  it("paying {1} more puts a mana value 2 find onto the battlefield", () => {
    const { game, a, ring, stone, spell } = setup(1);
    pickModes(a, 0);
    cast(game, spell);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("without {1} more, the find can't be paid for", () => {
    const { game, a, stone, spell } = setup(0);
    pickModes(a, 0);
    cast(game, spell);
    expect(zone(game, stone)).toBe("graveyard");
  });

  it("declining puts it into the graveyard", () => {
    const { game, a, stone, spell } = setup(1);
    pickModes(a);
    cast(game, spell);
    expect(zone(game, stone)).toBe("graveyard");
  });

  it("a find of no greater mana value goes onto the battlefield free", () => {
    const { game, a, spell } = setup(0);
    const thopter = toLibrary(game, "Ornithopter");
    pickFromZone(a, thopter);
    cast(game, spell);
    expect(zone(game, thopter)).toBe("battlefield");
  });
});
