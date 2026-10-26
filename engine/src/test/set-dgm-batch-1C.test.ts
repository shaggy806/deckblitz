/**
 * Dragon's Maze (DGM; B173), group C. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Tajic, Blade of the Legion", () => {
  it("gets +5/+5 attacking with two others, not with one", () => {
    const { game, a } = table();
    const tajic = spawn(game, "Tajic, Blade of the Legion");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, [tajic, ...bears]);
    expect(life(game, B)).toBe(20 - 7 - 2 - 2);
  });

  it("stays 2/2 with only one other attacker", () => {
    const { game, a } = table();
    const tajic = spawn(game, "Tajic, Blade of the Legion");
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [tajic, bear]);
    expect(life(game, B)).toBe(20 - 2 - 2);
  });
});

describe("Blast of Genius", () => {
  it("deals damage equal to the discarded card's mana value", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const wurm = toLibrary(game, "Craw Wurm");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    a.chooseDiscardsFn = () => [wurm];
    cast(game, toHand(game, "Blast of Genius"), { targets: [ref(B)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 6);
  });
});

describe("Rot Farm Skeleton", () => {
  it("returns from the graveyard, milling four as the cost", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const skeleton = toGraveyard(game, "Rot Farm Skeleton");
    const before = graveyard(game).length;
    activate(game, skeleton, 0);
    expect(zone(game, skeleton)).toBe("battlefield");
    expect(graveyard(game).length).toBe(before - 1 + 4);
  });
});

describe("Nivix Cyclops", () => {
  it("gets +3/+0 and can attack after an instant", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const cyclops = spawn(game, "Nivix Cyclops");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, cyclops)).toEqual({ power: 4, toughness: 4 });
    attack(game, a, [cyclops]);
    expect(life(game, B)).toBe(20 - 2 - 4);
  });
});

describe("Saruli Gatekeepers", () => {
  it("gains 7 life with two Gates", () => {
    const { game } = table();
    spawn(game, "Azorius Guildgate");
    spawn(game, "Azorius Guildgate");
    enter(game, "Saruli Gatekeepers");
    expect(life(game, A)).toBe(27);
  });

  it("gains nothing with one Gate", () => {
    const { game } = table();
    spawn(game, "Azorius Guildgate");
    enter(game, "Saruli Gatekeepers");
    expect(life(game, A)).toBe(20);
  });
});

describe("Smelt-Ward Gatekeepers", () => {
  it("with two Gates, steals, untaps and hastes an opponent's creature", () => {
    const { game, a } = table();
    spawn(game, "Azorius Guildgate");
    spawn(game, "Azorius Guildgate");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, bears);
    enter(game, "Smelt-Ward Gatekeepers");
    expect(controller(game, bears)).toBe(A);
    expect(tapped(game, bears)).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Maze Abomination", () => {
  it("gives deathtouch to multicolored creatures you control only", () => {
    const { game } = table();
    spawn(game, "Maze Abomination");
    const gold = spawn(game, "Deputy of Acquittals");
    const mono = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Deputy of Acquittals", B);
    expect(keywords(game, gold).has("deathtouch")).toBe(true);
    expect(keywords(game, mono).has("deathtouch")).toBe(false);
    expect(keywords(game, theirs).has("deathtouch")).toBe(false);
  });
});

describe("Haazda Snare Squad", () => {
  it("may pay {W} as it attacks to tap the target", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 1);
    const squad = spawn(game, "Haazda Snare Squad");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [squad]);
    expect(tapped(game, bears)).toBe(true);
    expect(tapped(game, plains[0])).toBe(true);
  });

  it("taps nothing when declined", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const squad = spawn(game, "Haazda Snare Squad");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickTargets(a, bears);
    attack(game, a, [squad]);
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Punish the Enemy", () => {
  it("deals 3 to the player and 3 to the creature", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Punish the Enemy"), { targets: [ref(B), ref(bears)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
