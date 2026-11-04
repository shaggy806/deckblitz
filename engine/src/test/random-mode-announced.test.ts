/**
 * "Choose one at random —" on a triggered or chapter ability: the mode is
 * picked as the ability goes on the stack, before its targets (rules 603.3c,
 * 700.2b), so players respond knowing it. Among the modes it could have (Umaro,
 * Raging Yeti's ruling). `modal`'s `announced` with `random`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { GameEvent } from "../events.js";
import {
  A,
  B,
  activate,
  attack,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const picks = (game: Game): readonly string[] =>
  game.state.eventLog
    .filter((e): e is Extract<GameEvent, { type: "chosen-at-random" }> => e.type === "chosen-at-random")
    .flatMap((e) => (e.chosen.kind === "mode" ? [e.chosen.text] : []));

/** A game seeded until Umaro's first pick is the mode with `text` in it. */
function seedPicking(setup: (game: Game) => void, run: (game: Game) => void, text: string): number {
  for (let seed = 1; seed < 200; seed += 1) {
    const { game } = table({ seed });
    setup(game);
    run(game);
    if (picks(game)[0]?.includes(text)) return seed;
  }
  throw new Error(`no seed picks ${text}`);
}

describe("Umaro, Raging Yeti", () => {
  const umaroToCombat = (game: Game): void => {
    game.advanceUntil((s) => s.turn.step === "begin-combat");
  };

  it("nobody is asked: the mode is picked and on the stack, with the other players able to read it", () => {
    const { game, a } = table();
    a.chooseModesFn = () => {
      throw new Error("no choice to make");
    };
    pickTargets(a, B);
    const umaro = spawn(game, "Umaro, Raging Yeti");
    umaroToCombat(game);
    expect(picks(game)).toHaveLength(1);
    const onStack = game.state.zones.shared.stack.map((id) => game.state.objects[id]);
    expect(onStack).toHaveLength(1);
    expect(onStack[0].chosenModes).toHaveLength(1);
    expect(game.state.objects[umaro].zone).toBe("battlefield");
  });

  it("the pump: others get +3/+0 and trample, Umaro doesn't", () => {
    const setup = (game: Game): void => {
      spawn(game, "Umaro, Raging Yeti");
      spawn(game, "Grizzly Bears");
    };
    const seed = seedPicking(setup, umaroToCombat, "Other creatures");
    const { game } = table({ seed });
    const umaro = spawn(game, "Umaro, Raging Yeti");
    const bears = spawn(game, "Grizzly Bears");
    umaroToCombat(game);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, umaro)).toEqual({ power: 6, toughness: 6 });
  });

  it("the wheel: the hand goes, four come", () => {
    const setup = (game: Game): void => {
      spawn(game, "Umaro, Raging Yeti");
    };
    const seed = seedPicking(setup, umaroToCombat, "Discard your hand");
    const { game } = table({ seed });
    spawn(game, "Umaro, Raging Yeti");
    const held = toHand(game, "Opt");
    umaroToCombat(game);
    settle(game);
    expect(zone(game, held)).toBe("graveyard");
    expect(hand(game)).toHaveLength(4);
  });

  it("the blast's target is chosen after the mode, as it goes on the stack", () => {
    const setup = (game: Game): void => {
      spawn(game, "Umaro, Raging Yeti");
    };
    const seed = seedPicking(setup, umaroToCombat, "5 damage");
    const { game, a } = table({ seed });
    spawn(game, "Umaro, Raging Yeti");
    const seen = watchTargets(a, () => [B]);
    umaroToCombat(game);
    settle(game);
    expect(seen.asked).toBe(1);
    expect(life(game, B)).toBe(15);
  });

  it("each of the three comes up", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed += 1) {
      const { game, a } = table({ seed });
      pickTargets(a, B);
      spawn(game, "Umaro, Raging Yeti");
      umaroToCombat(game);
      seen.add(picks(game)[0]);
    }
    expect(seen.size).toBe(3);
  });

  it("the same seed picks the same mode (determinism)", () => {
    const pickOf = (): string => {
      const { game, a } = table({ seed: 7 });
      pickTargets(a, B);
      spawn(game, "Umaro, Raging Yeti");
      umaroToCombat(game);
      return picks(game)[0];
    };
    expect(pickOf()).toBe(pickOf());
  });
});

describe("Cult of Skaro", () => {
  const attacked = (seed: number): { game: Game; cult: ReturnType<typeof spawn>; held: number } => {
    const { game, a } = table({ seed });
    const cult = spawn(game, "Cult of Skaro");
    const held = hand(game).length;
    attack(game, a, [cult]);
    return { game, cult, held };
  };

  it("every mode comes up, and does what it says", () => {
    const done = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) {
      const { game, cult, held } = attacked(seed);
      const text = picks(game)[0];
      done.add(text);
      if (text.startsWith("Thay")) expect(counters(game, cult)).toBe(1);
      if (text.startsWith("Caan")) expect(hand(game)).toHaveLength(held + 2);
      if (text.startsWith("Sec")) expect(tokensNamed(game, "Dalek Token")).toBe(1);
      if (text.startsWith("Jast")) expect(life(game, B)).toBe(16 - 4);
    }
    expect(done.size).toBe(4);
  });
});

describe("Typhoid Mary, Fractured", () => {
  it("no discard this turn: nobody chooses", () => {
    const { game, a } = table();
    a.chooseModesFn = () => {
      throw new Error("no choice to make");
    };
    const mary = spawn(game, "Typhoid Mary, Fractured");
    attack(game, a, [mary]);
    expect(picks(game)).toHaveLength(1);
  });

  it("a card discarded this turn: you choose, as it goes on the stack", () => {
    const { game, a } = table();
    const mary = spawn(game, "Typhoid Mary, Fractured");
    const witch = spawn(game, "Plague Witch");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Swamp");
    toHand(game, "Opt");
    activate(game, witch, 0, { targets: [ref(bears)] });
    pickModes(a, 2);
    const lifeBefore = life(game);
    attack(game, a, [mary]);
    expect(picks(game)).toHaveLength(0);
    expect(life(game)).toBe(lifeBefore + 2);
  });
});

describe("Summon: Magus Sisters", () => {
  it("each chapter picks its own mode, targets after, and the Saga goes after III", () => {
    const { game, a } = table();
    pickTargets(a, null);
    const sisters = enter(game, "Summon: Magus Sisters");
    expect(picks(game)).toHaveLength(1);
    settle(game);
    toStep(game, "precombat-main");
    settle(game);
    expect(picks(game)).toHaveLength(2);
    expect(zone(game, sisters)).toBe("battlefield");
    toStep(game, "precombat-main");
    settle(game);
    expect(picks(game)).toHaveLength(3);
    expect(graveyard(game)).toContain(sisters);
  });

  it("every mode comes up: counters, a shield and 3 life, the fight", () => {
    const done = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) {
      const { game, a } = table({ seed });
      const foe = spawn(game, "Grizzly Bears", B);
      pickTargets(a, foe);
      const sisters = game.debugSpawn("Summon: Magus Sisters", A, "battlefield", { announceEntry: true, summoningSick: false });
      const seen = watchTargets(a, (offered) => [offered[0].includes(foe) ? foe : sisters]);
      game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
      const text = picks(game)[0];
      done.add(text.split(" — ")[0]);
      expect(seen.asked).toBe(1);
      if (text.startsWith("Fight!")) expect(zone(game, foe)).toBe("graveyard");
      if (text.startsWith("Defense!")) expect(life(game)).toBe(23);
      if (text.startsWith("Combine")) expect(counters(game, foe) + counters(game, sisters)).toBe(3);
    }
    expect(done.size).toBe(3);
  });

  it("a mode that needs a target it can't have can't be picked: the Saga gone and no creature left, only the fight", () => {
    const done = new Set<string>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const { game, a } = table({ seed });
      a.chooseTargetsFn = (_view, _name, _specs, legal) => legal.map((slot) => slot[0] ?? null);
      // Chapter I triggered, then the Saga left before it went on the stack.
      const sisters = spawn(game, "Summon: Magus Sisters");
      game.state.pendingTriggers.push({
        sourceObjectId: sisters,
        cardName: "Summon: Magus Sisters",
        abilityIndex: 0,
        controller: A,
        chapter: true,
        lastKnownRefs: { source: game.state.objects[sisters].zoneChangeCount ?? 0 },
      });
      destroy(game, sisters);
      settle(game);
      done.add(picks(game)[0].split(" — ")[0]);
    }
    expect(done).toEqual(new Set(["Fight!"]));
  });
});
