/**
 * A batched `dies` trigger whose `{ triggerValue: true }` is the total power of
 * what died (`batchValue: "total-power"`), each as it last existed (rule
 * 603.10a): The Skullspore Nexus. And a token's `basePt` read unclamped (rule
 * 107.1b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  cast,
  lands,
  named,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const DINO = "Fungus Dinosaur Token";

const settled = (game: Game): void =>
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);

const wrathYours = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature", controlledBy: "you" } }, []);
  settled(game);
};

describe("The Skullspore Nexus", () => {
  it("costs {X} less, X the greatest power among your creatures", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm"); // 6/4
    lands(game, "Forest", 2);
    const nexus = toHand(game, "The Skullspore Nexus");
    cast(game, nexus);
    expect(zone(game, nexus)).toBe("battlefield");
  });

  it("makes one token for creatures that die together, its base P/T their total power", () => {
    const { game } = table();
    spawn(game, "The Skullspore Nexus");
    const bears = spawn(game, "Grizzly Bears"); // 2
    const wurm = spawn(game, "Craw Wurm"); // 6
    wrathYours(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
    const tokens = named(game, DINO);
    expect(tokens.length).toBe(1);
    expect(pt(game, tokens[0])).toEqual({ power: 8, toughness: 8 });
    expect(game.state.objects[tokens[0]].controller).toBe(A);
  });

  it("creatures that die apart make a token each", () => {
    const { game } = table();
    spawn(game, "The Skullspore Nexus");
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settled(game);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(wurm)]);
    settled(game);
    expect(named(game, DINO).map((id) => pt(game, id).power).sort()).toEqual([2, 6]);
  });

  it("reads each as it last existed: its counters count", () => {
    const { game } = table();
    spawn(game, "The Skullspore Nexus");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 3;
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settled(game);
    expect(pt(game, named(game, DINO)[0])).toEqual({ power: 5, toughness: 5 });
  });

  it("ignores another player's creatures", () => {
    const { game } = table();
    spawn(game, "The Skullspore Nexus");
    const theirs = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(theirs)]);
    settled(game);
    expect(named(game, DINO).length).toBe(0);
  });

  it("nontoken creatures only: a token dying alone doesn't trigger it, nor add its power", () => {
    const { game } = table();
    spawn(game, "The Skullspore Nexus");
    const make = { kind: "create-token", token: DINO, count: 1, basePt: { power: 5, toughness: 5 } } as const;
    game.debugApplyEffect(A, make, []);
    wrathYours(game);
    expect(named(game, DINO).length).toBe(0);

    game.debugApplyEffect(A, make, []);
    spawn(game, "Grizzly Bears");
    wrathYours(game);
    const tokens = named(game, DINO);
    expect(tokens.length).toBe(1);
    expect(pt(game, tokens[0])).toEqual({ power: 2, toughness: 2 });
  });

  it("{2}, {T}: doubles target creature's power until end of turn", () => {
    const { game } = table();
    const nexus = spawn(game, "The Skullspore Nexus");
    const wurm = spawn(game, "Craw Wurm");
    lands(game, "Forest", 2);
    activate(game, nexus, 0, { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 12, toughness: 4 });
    expect(game.state.objects[nexus].tapped).toBe(true);
  });
});

describe("a token's base power and toughness aren't clamped (rule 107.1b)", () => {
  it("sets less than 0", () => {
    const { game } = table();
    spawn(game, "Glorious Anthem");
    game.debugApplyEffect(A, { kind: "create-token", token: DINO, count: 1, basePt: { power: -1, toughness: -1 } }, []);
    // Anthem's +1/+1 over a base of -1. Clamped to 0 it would be a 1/1.
    expect(pt(game, named(game, DINO)[0])).toEqual({ power: 0, toughness: 0 });
  });
});
