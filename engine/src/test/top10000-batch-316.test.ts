// Batch 316: the top 5000's next ten (EDHREC 3596–3964), each on the feature
// it needed.

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  life,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
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

describe("Fear of Sleep Paralysis: an opponent's stun counters stay", () => {
  it("stuns on entering, and the opponent's creature never untaps", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Fear of Sleep Paralysis");
    expect(counters(game, bears, "stun")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });

  it("its controller's own stunned creature untaps as usual", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Fear of Sleep Paralysis");
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, bears, "stun")).toBe(0);
  });
});

describe("The Master, Multiplied: your triggers spare your creature tokens", () => {
  it("Kiki-Jiki's copy isn't sacrificed at the end step", () => {
    const { game } = table();
    spawn(game, "The Master, Multiplied");
    const kiki = spawn(game, "Kiki-Jiki, Mirror Breaker");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, kiki, 0, { targets: [ref(bears)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
  });

  it("Twinflame's copy isn't exiled", () => {
    const { game } = table();
    spawn(game, "The Master, Multiplied");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Twinflame"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
  });

  it("two legendary creature tokens of one name both stay", () => {
    const { game } = table();
    const master = spawn(game, "The Master, Multiplied");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 2 }, [ref(master)]);
    // Through a priority pass, so the state-based actions are checked.
    nextTurn(game);
    expect(tokensNamed(game, "The Master, Multiplied", A)).toBe(2);
    expect(zone(game, master)).toBe("battlefield");
  });
});

describe("Jegantha, the Wellspring: its mana can't pay generic costs", () => {
  const tapped = () => {
    const { game } = table();
    const elk = spawn(game, "Jegantha, the Wellspring");
    activate(game, elk, 0);
    return game;
  };

  it("pays coloured pips, and a {1}{G} needs another source for the {1}", () => {
    const game = tapped();
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears)).toThrow(/refused/);
    lands(game, "Wastes", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("can't pay a generic-only cost at all", () => {
    const game = tapped();
    expect(() => cast(game, toHand(game, "Mind Stone"))).toThrow(/refused/);
  });
});
