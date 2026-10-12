/**
 * The set walk, batch 63, part b (2026-10-12): Lorwyn Eclipsed.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { matchesFilter } from "../filter.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,

  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const isElf = (game: Game, id: ObjectId): boolean =>
  matchesFilter(game.state, registryOf(game), id, { subtype: "Elf" }, { you: A });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Giantfall", () => {
  it("first mode: your creature deals damage equal to its power, and takes none back", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Giantfall"), { modes: [0], targets: [ref(giant), ref(angel)] });
    expect(damage(game, angel)).toBe(3);
    expect(zone(game, giant)).toBe("battlefield");
    expect(damage(game, giant)).toBe(0);
  });

  it("deals no damage when your creature is gone as it resolves (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Giantfall"), { modes: [0], targets: [ref(giant), ref(angel)], settle: false });
    destroy(game, giant);
    settle(game);
    expect(zone(game, angel)).toBe("battlefield");
    expect(damage(game, angel)).toBe(0);
  });
});

describe("Glamer Gifter", () => {
  it("makes the other creature base 4/4 with every creature type until end of turn, counters on top", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Raging Goblin");
    game.state.objects[goblin].counters["+1/+1"] = 1;
    pickTargets(a, goblin);
    enter(game, "Glamer Gifter");
    expect(pt(game, goblin)).toEqual({ power: 5, toughness: 5 });
    expect(isElf(game, goblin)).toBe(true);
    toStep(game, "precombat-main", B);
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(isElf(game, goblin)).toBe(false);
  });
});

describe("Gloom Ripper", () => {
  it("X counts your Elves and the Elf cards in your graveyard: +X/+0 to yours, -0/-X to theirs", () => {
    const { game, a } = table();
    spawn(game, "Llanowar Elves");
    toGraveyard(game, "Llanowar Elves");
    toGraveyard(game, "Llanowar Elves", B); // not your graveyard
    spawn(game, "Llanowar Elves", B); // not an Elf you control
    const bear = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, bear, wurm);
    enter(game, "Gloom Ripper");
    // Gloom Ripper and the Llanowar Elves you control, plus one in your graveyard.
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, wurm)).toEqual({ power: 6, toughness: 1 });
  });

  it("the opponent's creature is optional", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    pickTargets(a, bear, null);
    enter(game, "Gloom Ripper");
    // X = 1: Gloom Ripper itself.
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Kinscaer Sentry", () => {
  it("puts a creature card with mana value up to the attackers' count onto the battlefield tapped and attacking", () => {
    const { game, a } = table();
    const sentry = spawn(game, "Kinscaer Sentry");
    const bear = spawn(game, "Grizzly Bears");
    const lions = toHand(game, "Savannah Lions");
    const second = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const seen = pickFromZone(a, second);
    attack(game, a, [sentry, bear]);
    // X = 2 attacking creatures: the four-drop isn't offered.
    expect(seen.offered).toEqual(expect.arrayContaining([lions, second]));
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, second)).toBe("battlefield");
    expect(game.state.objects[second].tapped).toBe(true);
    // 2 first strike + 2 + 2 from the one that entered attacking.
    expect(game.state.players[B].life).toBe(14);
    expect(game.state.players[A].life).toBe(22);
  });
});

describe("Kirol, Attentive First-Year", () => {
  it("taps two creatures — Kirol itself, though summoning sick — to copy a triggered ability", () => {
    const { game } = table();
    const kirol = spawn(game, "Kirol, Attentive First-Year", A, { sick: true });
    const bear = spawn(game, "Grizzly Bears", A, { sick: true });
    const before = hand(game).length;
    enter(game, "Elvish Visionary", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    const trigger = game.state.zones.shared.stack.find((id) => game.state.objects[id].kind === "ability")!;
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: kirol,
      abilityIndex: 0,
      targets: [ref(trigger)],
      tap: [kirol, bear],
    });
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    expect(game.state.objects[kirol].tapped).toBe(true);
    expect(game.state.objects[bear].tapped).toBe(true);
  });
});

describe("Lavaleaper", () => {
  it("gives every creature haste, and doubles a basic land's mana but not a nonbasic's", () => {
    const { game } = table();
    spawn(game, "Lavaleaper");
    const theirs = spawn(game, "Grizzly Bears", B, { sick: true });
    expect(keywords(game, theirs).has("haste")).toBe(true);
    const forest = spawn(game, "Forest");
    game.dispatch({ type: "activate-ability", player: A, source: forest, abilityIndex: 0, targets: [] });
    expect(poolCounts(game.state.players[A].manaPool).G).toBe(2);
    const bayou = spawn(game, "Bayou");
    game.dispatch({ type: "activate-ability", player: A, source: bayou, abilityIndex: 0, targets: [], manaColors: ["B"] });
    expect(poolCounts(game.state.players[A].manaPool).B).toBe(1);
  });
});

describe("Lluwen, Imperfect Naturalist", () => {
  it("mills four and may put a creature or land card from among them on top", () => {
    const { game, a } = table();
    const bear = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const shock = toLibrary(game, "Shock");
    toLibrary(game, "Opt");
    const seen = pickFromZone(a, bear);
    enter(game, "Lluwen, Imperfect Naturalist");
    expect([...seen.offered].sort()).toEqual([bear, forest].sort());
    expect(seen.offered).not.toContain(shock);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bear);
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("makes a Worm for each land card in your graveyard, the discarded one included", () => {
    const { game, a } = table();
    const lluwen = spawn(game, "Lluwen, Imperfect Naturalist");
    lands(game, "Swamp", 5);
    toGraveyard(game, "Forest");
    const discard = toHand(game, "Forest");
    a.chooseDiscardsFn = () => [discard];
    game.dispatch({ type: "activate-ability", player: A, source: lluwen, abilityIndex: 0, targets: [] });
    settle(game);
    expect(graveyard(game)).toContain(discard);
    expect(tokensNamed(game, "Worm Token", A)).toBe(2);
  });
});

describe("Midnight Tilling", () => {
  it("mills four, then you may return a permanent card from among them", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bear = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const shock = toLibrary(game, "Shock");
    const opt = toLibrary(game, "Opt");
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Midnight Tilling"));
    expect([...seen.offered].sort()).toEqual([bear, forest].sort());
    expect(hand(game)).toContain(forest);
    expect(graveyard(game)).toEqual(expect.arrayContaining([bear, shock, opt]));
  });
});

describe("Flock Impostor", () => {
  it("may return another creature you control, but never itself or an opponent's", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    let offered: readonly string[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      offered = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [ref(bear)];
    };
    const impostor = enter(game, "Flock Impostor");
    expect(offered).toEqual([bear]);
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, impostor)).toBe("battlefield");
    expect(named(game, "Flock Impostor")).toHaveLength(1);
  });
});
