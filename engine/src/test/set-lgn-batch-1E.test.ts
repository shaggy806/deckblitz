/**
 * Mirrodin (MRD) leftovers and Legions (LGN; B219), group E. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  named,
  pickModes,
  pt,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Ogre Leadfoot", () => {
  it("destroys an artifact creature that blocks it, not a plain creature", () => {
    const { game, a, b } = table();
    const ogre = spawn(game, "Ogre Leadfoot");
    const jugg = spawn(game, "Juggernaut", B);
    b.declareBlockersFn = () => [{ blocker: jugg, attacker: ogre }];
    attack(game, a, [ogre]);
    expect(zone(game, jugg)).toBe("graveyard");

    const { game: g2, a: a2, b: b2 } = table();
    const ogre2 = spawn(g2, "Ogre Leadfoot");
    const wurm = spawn(g2, "Craw Wurm", B);
    b2.declareBlockersFn = () => [{ blocker: wurm, attacker: ogre2 }];
    attack(g2, a2, [ogre2]);
    expect(zone(g2, wurm)).toBe("battlefield");
  });
});

describe("Skirk Drill Sergeant", () => {
  it("triggers on another player's Goblin dying; paying puts a Goblin permanent card from the top onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Skirk Drill Sergeant");
    const theirs = spawn(game, "Raging Goblin", B);
    const top = toLibrary(game, "Goblin Piker");
    pickModes(a, 0);
    destroy(game, theirs);
    expect(zone(game, top)).toBe("battlefield");
  });

  it("puts a non-Goblin card into the graveyard, and triggers on its own death", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const sergeant = spawn(game, "Skirk Drill Sergeant");
    const top = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, sergeant);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Caller of the Claw", () => {
  it("counts only your nontoken creatures that died this turn", () => {
    const { game } = table();
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Llanowar Elves"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    enter(game, "Caller of the Claw");
    expect(tokensNamed(game, "Bear Token", A)).toBe(2);
    // A real token dying adds nothing to a second Caller's count.
    destroy(game, named(game, "Bear Token", A)[0]);
    enter(game, "Caller of the Claw");
    expect(tokensNamed(game, "Bear Token", A)).toBe(3);
  });
});

describe("Gempalm Strider and Warped Researcher", () => {
  it("cycling pumps every player's Elves and gives the Researcher flying and shroud", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const researcher = spawn(game, "Warped Researcher");
    const theirElf = spawn(game, "Llanowar Elves", B);
    const before = graveyard(game).length;
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Gempalm Strider") });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(graveyard(game).length).toBe(before + 1);
    expect(pt(game, theirElf)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, researcher).has("flying")).toBe(true);
    expect(keywords(game, researcher).has("shroud")).toBe(true);
  });
});

describe("Goblin Lookout", () => {
  it("sacrifices a Goblin and pumps every player's Goblins", () => {
    const { game } = table();
    const lookout = spawn(game, "Goblin Lookout");
    const fodder = spawn(game, "Raging Goblin");
    const theirs = spawn(game, "Goblin Piker", B);
    game.dispatch({ type: "activate-ability", player: A, source: lookout, abilityIndex: 0, targets: [], sacrifice: fodder });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(pt(game, lookout)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 1 });
  });
});

describe("Vile Deacon", () => {
  it("counts every Cleric on the battlefield, an opponent's too", () => {
    const { game, a } = table();
    const deacon = spawn(game, "Vile Deacon");
    spawn(game, "Daru Mender", B);
    attack(game, a, [deacon]);
    expect(pt(game, deacon)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Cloudreach Cavalry", () => {
  it("gets +2/+2 and flying only while you control a Bird", () => {
    const { game } = table();
    const cavalry = spawn(game, "Cloudreach Cavalry");
    expect(pt(game, cavalry)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Birds of Paradise", B);
    expect(pt(game, cavalry)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Birds of Paradise");
    expect(pt(game, cavalry)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, cavalry).has("flying")).toBe(true);
  });
});
