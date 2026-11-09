/**
 * Theme 15 (rule 603.7): one step timing (`DelayedAt`), one duration on a
 * "whenever" watch, and an intervening "if" on any delayed ability (603.4).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { delayedStep, delayedStepFires, readDelayedAt } from "../delayed-at.js";
import type { Step } from "../turn.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  hand,
  lands,
  life,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const turn = { active: A, laterTurn: false, madeInThisEndStep: false, addedUpkeep: false };
const fires = (at: ReturnType<typeof delayedStep>, step: Step, over: Partial<typeof turn> = {}): boolean =>
  delayedStepFires(at, step, { ...turn, ...over });

describe("delayedStepFires", () => {
  it("a step, whoever's turn it is by default", () => {
    expect(fires(delayedStep("end"), "end")).toBe(true);
    expect(fires(delayedStep("end"), "upkeep")).toBe(false);
    expect(fires(delayedStep("end"), "end", { active: B })).toBe(true);
  });

  it("only in the turn of the player it names", () => {
    expect(fires(delayedStep("begin-combat", B), "begin-combat")).toBe(false);
    expect(fires(delayedStep("begin-combat", B), "begin-combat", { active: B })).toBe(true);
  });

  it("\"main\" is either main phase", () => {
    expect(fires(delayedStep("main"), "precombat-main")).toBe(true);
    expect(fires(delayedStep("main"), "postcombat-main")).toBe(true);
    expect(fires(delayedStep("precombat-main"), "postcombat-main")).toBe(false);
  });

  it("this turn only: a later turn's step doesn't fire it", () => {
    const at = delayedStep("begin-combat", "any", "this-turn");
    expect(fires(at, "begin-combat")).toBe(true);
    expect(fires(at, "begin-combat", { laterTurn: true })).toBe(false);
  });

  it("the next turn only once that turn has begun", () => {
    const at = delayedStep("end", A, "next-turn");
    expect(fires(at, "end")).toBe(false);
    expect(fires({ ...at, turnBegan: true }, "end")).toBe(true);
  });

  it("a step begun before it was made isn't the next one (500.9, 500.10)", () => {
    expect(fires(delayedStep("end"), "end", { madeInThisEndStep: true })).toBe(false);
    expect(fires(delayedStep("upkeep"), "upkeep")).toBe(false);
    expect(fires(delayedStep("upkeep"), "upkeep", { laterTurn: true })).toBe(true);
    expect(fires(delayedStep("upkeep"), "upkeep", { addedUpkeep: true })).toBe(true);
  });

  it("reads whose as it's set up: you is the ability's controller, and an unreadable player sets up nothing", () => {
    expect(readDelayedAt({ step: "end" }, A)).toEqual({ step: "end", whose: "any", which: "next" });
    expect(readDelayedAt({ step: "end", whose: "you" }, B)?.whose).toBe(B);
    expect(readDelayedAt({ step: "end", whose: "that-player" }, A, () => B)?.whose).toBe(B);
    expect(readDelayedAt({ step: "end", whose: "that-player" }, A, () => undefined)).toBeUndefined();
  });
});

describe("the old spellings are gone", () => {
  it(
    "no card or test names a step timing as a string, or the fields it replaced",
    () => {
      const old =
        /\b(?:at|returnAt):\s*"(?:next-end-step|next-upkeep|your-next-upkeep|your-next-end-step|your-next-main-phase|your-next-turn-end-step|end-of-combat|end-of-combat-this-turn|this-turn-end-step|next-cleanup)"|whileAnyExiled|\bturnOf: \{ target/;
      const pool = fileURLToPath(new URL("../cards/pool", import.meta.url));
      const offenders = readdirSync(pool).filter((file) => old.test(readFileSync(join(pool, file), "utf8")));
      expect(offenders).toEqual([]);
    },
    60_000,
  );
});

describe("an intervening if on a delayed ability (603.4): Fight for the Throne", () => {
  function fight(commanderHere: boolean) {
    const { game } = table();
    lands(game, "Forest", 2);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    if (commanderHere) game.state.objects[spawn(game, "Grizzly Bears")].isCommander = true;
    return { game, mine, theirs };
  }

  it("with your commander out, its death makes you the monarch", () => {
    const { game, mine, theirs } = fight(true);
    cast(game, toHand(game, "Fight for the Throne"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.monarch).toBe(A);
  });

  it("without it, the ability doesn't trigger, and is used up", () => {
    const { game, mine, theirs } = fight(false);
    cast(game, toHand(game, "Fight for the Throne"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.monarch ?? null).toBe(null);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});

describe("Loki Laufeyson reads his power as the spell is cast", () => {
  function lokiReady() {
    const { game, a } = table();
    lands(game, "Mountain", 10);
    const loki = spawn(game, "Loki Laufeyson");
    activate(game, loki, 0);
    return { game, a, loki };
  }

  it("too dear at power 2: no copy, and the watch stays", () => {
    const { game } = lokiReady();
    const start = life(game, B);
    cast(game, toHand(game, "Char"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(start - 4);
    expect(game.state.delayedTriggers).toHaveLength(1);
  });

  it("counters put on him after the activation count", () => {
    const { game, loki } = lokiReady();
    activate(game, loki, 1);
    const start = life(game, B);
    cast(game, toHand(game, "Char"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(start - 8);
  });
});

describe("a group flicker with a step of its own", () => {
  it("Ghostway: each creature you control back at the end step, an opponent's left alone", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ghostway"));
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Planar Guide: every creature, under its owner's control", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const guide = spawn(game, "Planar Guide");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, guide, 0);
    expect(zone(game, guide)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(B);
    expect(zone(game, guide)).toBe("exile");
  });

  it("Legion's Initiative: back at the next beginning of combat, with haste", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const initiative = spawn(game, "Legion's Initiative");
    const mine = spawn(game, "Hill Giant");
    activate(game, initiative, 0);
    expect(zone(game, mine)).toBe("exile");
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].modifiers.some((m) => m.keywords?.includes("haste"))).toBe(true);
  });
});

describe("a step of a player's own", () => {
  it("Phytotitan: back tapped at its owner's next upkeep, not the next upkeep", () => {
    const { game } = table();
    const titan = spawn(game, "Phytotitan");
    destroy(game, titan);
    settle(game);
    expect(zone(game, titan)).toBe("graveyard");
    nextTurn(game, "upkeep"); // Bob's
    settle(game);
    expect(zone(game, titan)).toBe("graveyard");
    nextTurn(game, "upkeep"); // Alice's
    settle(game);
    expect(zone(game, titan)).toBe("battlefield");
    expect(game.state.objects[titan].tapped).toBe(true);
  });

  it("Plasm Capture: X mana at your next first main phase, X read from the countered spell", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const axe = toHand(game, "Lava Axe");
    cast(game, axe, { targets: [{ kind: "player", player: B }], settle: false });
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Plasm Capture"), { targets: [ref(axe)] });
    expect(zone(game, axe)).toBe("graveyard");
    expect(game.state.delayedTriggers).toHaveLength(1);
    nextTurn(game); // Bob's main phase isn't yours
    expect(game.state.delayedTriggers).toHaveLength(1);
    nextTurn(game);
    expect(game.state.delayedTriggers).toHaveLength(0);
    settle(game);
    expect(game.state.players[A].manaPool.length).toBe(5);
  });
});

describe("the next main phase this turn: Vivien's Stampede", () => {
  it("draws for each player dealt combat damage, in the postcombat main", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Vivien's Stampede"));
    const before = hand(game, A).length;
    attack(game, a, [giant]);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length === 0);
    expect(hand(game, A).length).toBe(before + 1);
    expect(game.state.delayedTriggers).toHaveLength(0);
    // Hill Giant's 3, and melee's +1 for the one opponent attacked.
    expect(life(game, B)).toBe(16);
  });

  it("cast after the last main phase has begun, it lapses with the turn", () => {
    const { game } = table({ step: "postcombat-main" });
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Vivien's Stampede"));
    expect(game.state.delayedTriggers).toHaveLength(1);
    nextTurn(game);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});

describe("a watch that lasts through your next turn: Season of the Bold's third mode", () => {
  it("fires on this turn and your next, and not after", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Season of the Bold"), { modes: [2] });
    expect(game.state.delayedTriggers).toHaveLength(1);
    nextTurn(game); // Bob's
    expect(game.state.delayedTriggers).toHaveLength(1);
    nextTurn(game); // Alice's next
    expect(game.state.delayedTriggers).toHaveLength(1);
    nextTurn(game); // Bob's again: it has ended
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});

describe("a delayed ability keeps its creator's X: Storm King's Thunder", () => {
  it("copies that spell X times", () => {
    const { game } = table();
    lands(game, "Mountain", 10);
    cast(game, toHand(game, "Storm King's Thunder"), { x: 2 });
    const start = life(game, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(start - 9);
  });
});

describe("kicked or not: Vigorous Charge", () => {
  it("only kicked does its combat damage gain you life", () => {
    for (const kicked of [true, false]) {
      const { game, a } = table({ step: "begin-combat" });
      lands(game, "Forest", 1);
      lands(game, "Plains", 1);
      const giant = spawn(game, "Hill Giant");
      cast(game, toHand(game, "Vigorous Charge"), { targets: [ref(giant)], kicked });
      attack(game, a, [giant]);
      expect(life(game, A)).toBe(kicked ? 23 : 20);
    }
  });
});

describe("that many, from the watch: Fire Giant's Fury", () => {
  it("exiles as many cards as the Giant dealt to the player", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Fire Giant's Fury"), { targets: [ref(giant)] });
    attack(game, a, [giant]);
    const exiled = Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === A);
    expect(exiled).toHaveLength(5);
  });
});
