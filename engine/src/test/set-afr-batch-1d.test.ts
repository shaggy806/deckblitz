/**
 * Adventures in the Forgotten Realms and its Commander set, group d: Lightfoot Rogue, Earth-Cult
 * Elemental, Ebony Fly, Drider, Bar the Gate, Lorcan, Warlock Collector, Spiked Pit Trap, Meteor
 * Swarm, Wild Shape, Grim Wanderer, Purple Worm and Mordenkainen's Polymorph. The d20 cards are
 * checked against the roll the game recorded (`GameState.lastRoll`) over several seeds.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const rolled = (game: Game): number => game.state.lastRoll!.total;
const battlefieldOf = (game: Game, player: typeof A): number =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === player).length;

describe("Lightfoot Rogue", () => {
  it("attacking: the d20 row decides its bonus", () => {
    const seen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, a } = table({ seed });
      const rogue = spawn(game, "Lightfoot Rogue");
      attack(game, a, [rogue]);
      const roll = rolled(game);
      const kw = keywords(game, rogue);
      expect(kw.has("deathtouch")).toBe(true);
      if (roll <= 9) {
        seen.add("low");
        expect(pt(game, rogue).power).toBe(2);
        expect(kw.has("first-strike")).toBe(false);
      } else if (roll <= 19) {
        seen.add("mid");
        expect(pt(game, rogue).power).toBe(3);
        expect(kw.has("first-strike")).toBe(false);
      } else {
        expect(pt(game, rogue).power).toBe(5);
        expect(kw.has("first-strike")).toBe(true);
      }
    }
    expect(seen.size).toBe(2);
  });
});

describe("Earth-Cult Elemental", () => {
  it("entering: each player, or each opponent, sacrifices by the d20 row", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      lands(game, "Wastes", 1);
      lands(game, "Wastes", 3, B);
      enter(game, "Earth-Cult Elemental");
      const roll = rolled(game);
      expect(battlefieldOf(game, A)).toBe(roll <= 9 ? 1 : 2);
      expect(battlefieldOf(game, B)).toBe(roll === 20 ? 1 : 2);
    }
  });
});

describe("Ebony Fly", () => {
  it("{4}: becomes an X/X flying Insect artifact creature of the d6, if you choose", () => {
    const { game, a } = table();
    const fly = spawn(game, "Ebony Fly");
    lands(game, "Wastes", 4);
    a.chooseModesFn = () => [0];
    activate(game, fly, 1);
    const x = rolled(game);
    expect(x).toBeGreaterThanOrEqual(1);
    expect(x).toBeLessThanOrEqual(6);
    expect(pt(game, fly)).toEqual({ power: x, toughness: x });
    expect(types(game, fly)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, fly)).toContain("Insect");
    expect(keywords(game, fly).has("flying")).toBe(true);
  });

  it("declining after the roll leaves it a noncreature artifact", () => {
    const { game, a } = table();
    const fly = spawn(game, "Ebony Fly");
    lands(game, "Wastes", 4);
    a.chooseModesFn = () => [];
    activate(game, fly, 1);
    expect(game.state.lastRoll).toBeDefined();
    expect(types(game, fly)).not.toContain("creature");
  });

  it("enters tapped", () => {
    const { game } = table();
    const fly = enter(game, "Ebony Fly");
    expect(game.state.objects[fly].tapped).toBe(true);
  });
});

describe("Drider", () => {
  it("combat damage to a player makes a 2/1 black Spider with reach and menace", () => {
    const { game, a } = table();
    const drider = spawn(game, "Drider");
    attack(game, a, [drider]);
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "2/1 Black Spider Token (Menace, Reach)", A)).toBe(1);
    const spider = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "2/1 Black Spider Token (Menace, Reach)",
    )!;
    expect(pt(game, spider)).toEqual({ power: 2, toughness: 1 });
    expect([...keywords(game, spider)].sort()).toEqual(["menace", "reach"]);
  });
});

describe("Bar the Gate", () => {
  it("counters a creature spell and ventures into the dungeon", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Bar the Gate"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.eventLog.filter((e) => e.type === "ventured" && e.player === A)).toHaveLength(1);
  });

  it("can't target a noncreature spell", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const opt = toHand(game, "Opt");
    cast(game, opt, { settle: false });
    expect(() => cast(game, toHand(game, "Bar the Gate"), { targets: [ref(opt)] })).toThrow();
  });
});

describe("Lorcan, Warlock Collector", () => {
  it("pays life equal to the mana value to take an opponent's dying creature, a Warlock", () => {
    const { game, a } = table();
    spawn(game, "Lorcan, Warlock Collector");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    destroy(game, bears);
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Warlock"]));
  });

  it("declining leaves the card in its owner's graveyard", () => {
    const { game, a } = table();
    spawn(game, "Lorcan, Warlock Collector");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [];
    destroy(game, bears);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a Warlock you control that would die is exiled instead — any Warlock, collected or not", () => {
    const { game } = table();
    spawn(game, "Lorcan, Warlock Collector");
    const wanderer = spawn(game, "Grim Wanderer");
    const theirs = spawn(game, "Grim Wanderer", B);
    destroy(game, wanderer);
    settle(game);
    expect(zone(game, wanderer)).toBe("exile");
    destroy(game, theirs, A);
    settle(game);
    expect(zone(game, theirs)).not.toBe("exile");
  });
});

describe("Spiked Pit Trap", () => {
  it("5 damage to the target, and a Treasure on 10 or more", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      const trap = spawn(game, "Spiked Pit Trap");
      lands(game, "Wastes", 5);
      const big = spawn(game, "Earth-Cult Elemental", B);
      activate(game, trap, 0, { targets: [ref(big)] });
      expect(zone(game, trap)).toBe("graveyard");
      expect(game.state.objects[big].damageMarked).toBe(5);
      expect(tokensNamed(game, "Treasure Token", A)).toBe(rolled(game) >= 10 ? 1 : 0);
    }
  });
});

describe("Meteor Swarm", () => {
  it("8 damage divided as cast among exactly X targets", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const elemental = spawn(game, "Earth-Cult Elemental", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Meteor Swarm"), { x: 2, targets: [ref(elemental), ref(bears)], division: [5, 3] });
    expect(game.state.objects[elemental].damageMarked).toBe(5);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("needs X targets, not fewer", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const elemental = spawn(game, "Earth-Cult Elemental", B);
    expect(() =>
      cast(game, toHand(game, "Meteor Swarm"), { x: 2, targets: [ref(elemental)], division: [8] }),
    ).toThrow();
  });
});

describe("Wild Shape", () => {
  it("base 1/5 Spider with reach until end of turn: other creature types go, abilities and counters stay", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const angel = spawn(game, "Serra Angel");
    game.state.objects[angel].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Wild Shape"), { modes: [1], targets: [ref(angel)] });
    expect(counters(game, angel)).toBe(1);
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 6 });
    expect(subtypes(game, angel)).toEqual(["Spider"]);
    const kw = keywords(game, angel);
    expect(kw.has("reach")).toBe(true);
    expect(kw.has("flying")).toBe(true);
  });
});

describe("Grim Wanderer", () => {
  it("can be cast only once a creature died this turn — anyone's", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const wanderer = toHand(game, "Grim Wanderer");
    expect(() => cast(game, wanderer)).toThrow();
    destroy(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    cast(game, wanderer);
    expect(zone(game, wanderer)).toBe("battlefield");
  });
});

describe("Purple Worm", () => {
  it("costs {2} less once a creature died this turn", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const worm = toHand(game, "Purple Worm");
    expect(() => cast(game, worm)).toThrow();
    destroy(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    cast(game, worm);
    expect(zone(game, worm)).toBe("battlefield");
  });
});

describe("Mordenkainen's Polymorph", () => {
  it("a 4/4 flying Dragon until end of turn, its other creature types gone", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Mordenkainen's Polymorph"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, bears)).toEqual(["Dragon"]);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});
