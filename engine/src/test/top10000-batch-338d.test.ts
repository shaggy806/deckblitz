/**
 * Top-10000 batch 338d (lane replacements-copies): Spider-Woman, Secret
 * Agent's lock — a `prohibit` effect's `untap` act bound to its target and
 * lasting `while-you-control-source`, which stops every untap (not only the
 * untap step's, rule 502.3) until her controller loses her.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toStep,
  zone,
} from "./harness.js";

describe("top-10000 batch 338d — Spider-Woman, Secret Agent", () => {
  it("taps the creature, which stays tapped through untap steps and untap effects while she stays", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const woman = enter(game, "Spider-Woman, Secret Agent");
    expect(game.state.objects[bears].tapped).toBe(true);
    // An untap effect can't untap it either ("can't become untapped").
    game.debugApplyEffect(B, { kind: "untap", target: 0 }, [{ kind: "object", object: bears }]);
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game); // bob's untap step
    expect(game.state.objects[bears].tapped).toBe(true);
    // Once she leaves, the next untap step untaps it.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: woman }]);
    settle(game);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("ends when another player gains control of her", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const woman = enter(game, "Spider-Woman, Secret Agent");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [
      { kind: "object", object: woman },
    ]);
    settle(game);
    expect(game.state.objects[woman].controller).toBe(B);
    nextTurn(game); // bob's untap step
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("top-10000 batch 338d — Emissary of Soulfire (exalted counters, rule 122.1b)", () => {
  it("puts an exalted counter for {E}{E}; each counter is an instance of exalted", () => {
    const { game, a } = table();
    const emissary = enter(game, "Emissary of Soulfire");
    expect(game.state.players[A].energy).toBe(3);
    const wurm = spawn(game, "Craw Wurm"); // 6/4
    activate(game, emissary, 0, { targets: [ref(wurm)] });
    expect(game.state.players[A].energy).toBe(1);
    expect(counters(game, wurm, "exalted")).toBe(1);
    // A second counter, on the Emissary: exalted counts among every
    // permanent you control, not only the attacker.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "exalted", amount: 1 }, [
      { kind: "object", object: emissary },
    ]);
    settle(game);
    attack(game, a, [wurm]);
    expect(pt(game, wurm)).toEqual({ power: 8, toughness: 6 });
    expect(game.state.players[B].life).toBe(12);
  });

  it("gives as many instances as counters, and none when two attack", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "exalted", amount: 2 }, [
      { kind: "object", object: wurm },
    ]);
    settle(game);
    attack(game, a, [wurm, bears]);
    expect(pt(game, wurm)).toEqual({ power: 6, toughness: 4 });
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("top-10000 batch 338d — Bludgeon Brawl", () => {
  it("makes each player's noncreature, non-Equipment artifacts Equipment with equip {X} and +X/+0", () => {
    const { game } = table();
    const brawl = spawn(game, "Bludgeon Brawl");
    const mine = spawn(game, "Howling Mine"); // mana value 2
    const ring = spawn(game, "Sol Ring", B);
    const splitter = spawn(game, "Bonesplitter");
    const bears = spawn(game, "Grizzly Bears");
    expect(subtypes(game, mine)).toContain("Equipment");
    expect(subtypes(game, ring)).toContain("Equipment");
    lands(game, "Wastes", 2);
    // Already Equipment: no second equip ability.
    expect(game.legalActions(A).filter((l) => l.kind === "activate-ability" && l.source === splitter).length).toBe(1);
    // X is the artifact's mana value, not chosen.
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: mine, abilityIndex: 0, targets: [ref(bears)], xValue: 1 }),
    ).not.toBeNull();
    activate(game, mine, 0, { targets: [ref(bears)], x: 2 });
    expect(game.state.objects[mine].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    // Once Bludgeon Brawl leaves, the Howling Mine is no Equipment and falls off.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: brawl }]);
    toStep(game, "end"); // the debug effect runs no state-based actions
    expect(subtypes(game, mine)).not.toContain("Equipment");
    expect(game.state.objects[mine].attachedTo).toBeNull();
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("an attached artifact that becomes a creature stops being Equipment and falls off", () => {
    const { game } = table();
    spawn(game, "Bludgeon Brawl");
    const mine = spawn(game, "Howling Mine");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, mine, 0, { targets: [ref(bears)], x: 2 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    game.debugApplyEffect(
      A,
      { kind: "become", target: 0, addTypes: ["creature"], power: 2, toughness: 2, duration: "end-of-turn" },
      [{ kind: "object", object: mine }],
    );
    settle(game);
    toStep(game, "end");
    expect(game.state.objects[mine].attachedTo).toBeNull();
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("top-10000 batch 338d — Hold for Ransom", () => {
  it("the enchanted creature's controller pays {7}: the Aura's controller sacrifices it and draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ransom = spawn(game, "Hold for Ransom");
    game.state.objects[ransom].attachedTo = bears;
    expect(game.characteristics(bears).restrictions.has("cant-attack")).toBe(true);
    lands(game, "Wastes", 7, B);
    const aliceHand = hand(game, A).length;
    const bobHand = hand(game, B).length;
    // Alice can't activate it: she doesn't control the creature.
    expect(game.canDispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [] })).not.toBeNull();
    nextTurn(game); // bob's turn, sorcery timing
    const bobDrew = hand(game, B).length - bobHand;
    activate(game, bears, 0, { player: B });
    expect(zone(game, ransom)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(ransom);
    expect(hand(game, A).length).toBe(aliceHand + 1);
    expect(hand(game, B).length).toBe(bobHand + bobDrew);
    expect(game.characteristics(bears).restrictions.has("cant-attack")).toBe(false);
  });
});
