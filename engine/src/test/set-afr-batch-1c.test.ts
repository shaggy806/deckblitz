/**
 * Adventures in the Forgotten Realms and its Commander set, group c: Danse Macabre, Hive of the
 * Eye Tyrant, Fly, Clever Conjurer, Goblin Morningstar, Dragon Turtle, Aberrant Mind Sorcerer,
 * Precipitous Drop, Scion of Stygia, Blue Dragon, Song of Inspiration, Fey Steed, Divine Smite,
 * Jaded Sell-Sword, Ray of Enfeeblement and Lurking Roper. The d20 cards are checked against the
 * roll recorded (`GameState.lastRoll`) over several seeds, each row seen at least once.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const ventures = (game: Game, player = A): number =>
  game.state.eventLog.filter((e) => e.type === "ventured" && e.player === player).length;

const intoLostMine = (seat: ScriptedController): void => {
  seat.chooseVentureFn = (_view, offer) =>
    offer.dungeons !== undefined ? { dungeon: "Lost Mine of Phandelver" } : { room: offer.rooms![0]! };
};

const roll = (game: Game): { natural: number; total: number } => {
  const last = game.state.lastRoll!;
  return { natural: last.results.reduce((n, r) => n + r, 0), total: last.total };
};

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

describe("Danse Macabre", () => {
  it("each player sacrifices; the roll adds your creature's toughness; the row decides how many come back", () => {
    const rows = new Set<string>();
    for (const seed of SEEDS) {
      const { game, a } = table({ seed });
      lands(game, "Swamp", 5);
      const bears = spawn(game, "Grizzly Bears");
      const giant = spawn(game, "Hill Giant", B);
      // A token isn't a nontoken creature: bob's only choice is the Giant.
      game.debugApplyEffect(B, { kind: "create-token", token: "Goblin Token", count: 1 });
      settle(game);
      let offered: readonly string[] = [];
      a.chooseFromZoneFn = (_view, eligible) => {
        offered = eligible;
        return roll(game).total >= 15 ? [bears, giant] : [giant];
      };
      cast(game, toHand(game, "Danse Macabre"));
      const { natural, total } = roll(game);
      expect(total).toBe(natural + 2);
      expect([...offered].sort()).toEqual([bears, giant].sort());
      expect(zone(game, giant)).toBe("battlefield");
      expect(controller(game, giant)).toBe(A);
      expect(tokensNamed(game, "Goblin Token", B)).toBe(1);
      if (total >= 15) {
        expect(zone(game, bears)).toBe("battlefield");
        rows.add("15+");
      } else {
        expect(zone(game, bears)).toBe("graveyard");
        rows.add("1-14");
      }
    }
    expect(rows.size).toBe(2);
  });
});

describe("Hive of the Eye Tyrant", () => {
  it("becomes a 3/3 black Beholder with menace that exiles a card from the defender's graveyard as it attacks", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const hive = spawn(game, "Hive of the Eye Tyrant");
    const card = toGraveyard(game, "Grizzly Bears", B);
    activate(game, hive, 1);
    game.state.objects[hive].tapped = false;
    const c = game.characteristics(hive);
    expect([c.power, c.toughness]).toEqual([3, 3]);
    expect(c.types).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(c.subtypes).toContain("Beholder");
    expect([...c.colors]).toEqual(["B"]);
    expect(keywords(game, hive).has("menace")).toBe(true);
    pickTargets(a, card);
    attack(game, a, [hive]);
    expect(zone(game, card)).toBe("exile");
    expect(life(game, B)).toBe(17);
  });
});

describe("Fly", () => {
  it("gives flying and a venture on combat damage to a player — the creature's controller ventures", () => {
    const { game, a } = table();
    intoLostMine(a);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Fly"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(ventures(game)).toBe(1);
  });
});

describe("Clever Conjurer", () => {
  it("untaps a permanent not named Clever Conjurer — never itself", () => {
    const { game } = table();
    const conjurer = spawn(game, "Clever Conjurer");
    const land = spawn(game, "Island", A, { tapped: true });
    const self = { type: "activate-ability", player: A, source: conjurer, abilityIndex: 0, targets: [ref(conjurer)] } as const;
    expect(game.canDispatch(self)).not.toBeNull();
    activate(game, conjurer, 0, { targets: [ref(land)] });
    expect(game.state.objects[land].tapped).toBe(false);
  });
});

describe("Goblin Morningstar", () => {
  it("makes a Goblin, equipped on 10—20", () => {
    const rows = new Set<string>();
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      const star = enter(game, "Goblin Morningstar");
      const [goblin] = game.state.zones.shared.battlefield.filter(
        (id) => game.state.objects[id].cardName === "Goblin Token",
      );
      expect(goblin).toBeDefined();
      const equipped = game.state.objects[star].attachedTo === goblin;
      expect(equipped).toBe(roll(game).total >= 10);
      if (equipped) expect(pt(game, goblin)).toEqual({ power: 2, toughness: 1 });
      rows.add(equipped ? "10-20" : "1-9");
    }
    expect(rows.size).toBe(2);
  });
});

describe("Dragon Turtle", () => {
  it("taps itself and the target; neither untaps in its controller's next untap step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const turtle = enter(game, "Dragon Turtle");
    expect(game.state.objects[turtle].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[turtle].tapped).toBe(true);
  });

  it("with no target chosen it still taps itself", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    const turtle = enter(game, "Dragon Turtle");
    expect(game.state.objects[turtle].tapped).toBe(true);
  });

  it("with its target gone illegal the whole ability does nothing (the ruling)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const turtle = enter(game, "Dragon Turtle", A, { settle: false });
    // Put the trigger on the stack, then take its target away.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.pendingTriggers.length === 0);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(game.state.objects[turtle].tapped).toBe(false);
  });
});

describe("Aberrant Mind Sorcerer", () => {
  it("1—9 may put the card on top of your library; 10—20 returns it to your hand", () => {
    const rows = new Set<string>();
    for (const seed of SEEDS) {
      const { game, a } = table({ seed });
      const bolt = toGraveyard(game, "Lightning Bolt");
      pickTargets(a, bolt);
      pickModes(a, 0);
      enter(game, "Aberrant Mind Sorcerer");
      if (roll(game).total >= 10) {
        expect(zone(game, bolt)).toBe("hand");
        rows.add("10-20");
      } else {
        expect(zone(game, bolt)).toBe("library");
        expect(game.state.zones.perPlayer[A].library[0]).toBe(bolt);
        rows.add("1-9");
      }
    }
    expect(rows.size).toBe(2);
  });
});

describe("Precipitous Drop", () => {
  it("ventures, and gives -2/-2 — -5/-5 once its controller has completed a dungeon", () => {
    const { game, a } = table();
    intoLostMine(a);
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Precipitous Drop"), { targets: [ref(giant)] });
    expect(ventures(game)).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 2 });
    // The creature's controller completing one doesn't count (the ruling).
    game.state.players[B].completedDungeons = ["Lost Mine of Phandelver"];
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 2 });
    game.state.players[A].completedDungeons = ["Lost Mine of Phandelver"];
    expect(pt(game, giant)).toEqual({ power: 1, toughness: -1 });
  });
});

describe("Scion of Stygia", () => {
  it("taps the target; on 10—20 it also skips its controller's next untap", () => {
    const rows = new Set<string>();
    for (const seed of SEEDS) {
      const { game, a } = table({ seed });
      const bears = spawn(game, "Grizzly Bears", B);
      pickTargets(a, bears);
      enter(game, "Scion of Stygia");
      expect(game.state.objects[bears].tapped).toBe(true);
      const frozen = roll(game).total >= 10;
      nextTurn(game);
      expect(game.state.objects[bears].tapped).toBe(frozen);
      rows.add(frozen ? "10-20" : "1-9");
    }
    expect(rows.size).toBe(2);
  });
});

describe("Blue Dragon", () => {
  it("-3/-0, -2/-0 and -1/-0 to three different creatures until your next turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions");
    pickTargets(a, giant, bears, lions);
    enter(game, "Blue Dragon");
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
    expect(pt(game, lions)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("the first target must be an opponent's creature", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const lions = spawn(game, "Savannah Lions");
    const seen = watchTargets(a, () => [giant, null, null]);
    enter(game, "Blue Dragon");
    expect(seen.offered[0]).toEqual([giant]);
    expect(seen.offered[1]).toContain(lions);
  });
});

describe("Song of Inspiration", () => {
  it("adds the targets' total mana value to the roll; on 15+ you also gain that much life", () => {
    const rows = new Set<string>();
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      lands(game, "Forest", 5);
      const wurm = toGraveyard(game, "Craw Wurm");
      const bears = toGraveyard(game, "Grizzly Bears");
      cast(game, toHand(game, "Song of Inspiration"), { targets: [ref(wurm), ref(bears)] });
      const { natural, total } = roll(game);
      expect(total).toBe(natural + 8);
      expect(zone(game, wurm)).toBe("hand");
      expect(zone(game, bears)).toBe("hand");
      expect(life(game)).toBe(total >= 15 ? 28 : 20);
      rows.add(total >= 15 ? "15+" : "1-14");
    }
    expect(rows.size).toBe(2);
  });

  it("a target gone by resolution isn't returned and adds nothing", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const wurm = toGraveyard(game, "Craw Wurm");
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Song of Inspiration"), { targets: [ref(wurm), ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(wurm)]);
    settle(game);
    expect(zone(game, wurm)).toBe("exile");
    expect(zone(game, bears)).toBe("hand");
    const { natural, total } = roll(game);
    expect(total).toBe(natural + 2);
  });
});

describe("Fey Steed", () => {
  it("draws when an opponent's spell targets a creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Fey Steed");
    pickModes(a, 0);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(bears)] });
    expect(hand(game, A).length).toBe(before + 1);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("gives another attacking creature you control indestructible", () => {
    const { game, a } = table();
    const steed = spawn(game, "Fey Steed");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.declareAttackersFn = () => [steed, bears].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, steed).has("indestructible")).toBe(false);
  });
});

describe("Divine Smite", () => {
  it("phases out a nonblack permanent, exiles a black one", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const nighthawk = spawn(game, "Vampire Nighthawk", B);
    cast(game, toHand(game, "Divine Smite"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("phased-out");
    cast(game, toHand(game, "Divine Smite"), { targets: [ref(nighthawk)] });
    expect(zone(game, nighthawk)).toBe("exile");
  });
});

describe("Jaded Sell-Sword", () => {
  it("first strike and haste only when mana from a Treasure was spent to cast it", () => {
    const withTreasure = table().game;
    lands(withTreasure, "Mountain", 3);
    spawn(withTreasure, "Treasure Token");
    const paid = toHand(withTreasure, "Jaded Sell-Sword");
    cast(withTreasure, paid);
    expect(keywords(withTreasure, paid).has("first-strike")).toBe(true);
    expect(keywords(withTreasure, paid).has("haste")).toBe(true);

    const without = table().game;
    lands(without, "Mountain", 4);
    const plain = toHand(without, "Jaded Sell-Sword");
    cast(without, plain);
    expect(zone(without, plain)).toBe("battlefield");
    expect(keywords(without, plain).has("haste")).toBe(false);
  });
});

describe("Ray of Enfeeblement", () => {
  it("-4/-1, or -4/-4 to a white creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Ray of Enfeeblement"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 2, toughness: 3 });
    cast(game, toHand(game, "Ray of Enfeeblement"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(angel);
  });
});

describe("Lurking Roper", () => {
  it("doesn't untap in your untap step; gaining life untaps it", () => {
    const { game } = table();
    const roper = spawn(game, "Lurking Roper", A, { tapped: true });
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[roper].tapped).toBe(true);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(game.state.objects[roper].tapped).toBe(false);
  });
});
