/**
 * The set walk, batch 61, part c (2026-10-12): Secrets of Strixhaven and Teenage Mutant Ninja Turtles.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** The prepare spell copy in exile a prepared permanent made (rule 722.3c). */
const preparedCopy = (game: Game): ObjectId | undefined =>
  game.state.zones.shared.exile.find((id) => game.state.objects[id].preparedFor !== undefined);
const enterPrepared = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, player, "battlefield", { announceEntry: true, summoningSick: false });
  settle(game);
  return id;
};
const tokens = (game: Game, player: PlayerId = A): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].controller === player);

describe("Applied Geometry", () => {
  it("copies a noncreature artifact as a 0/0 Fractal artifact creature with six +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const ring = spawn(game, "Sol Ring");
    const geometry = toHand(game, "Applied Geometry");
    cast(game, geometry, { targets: [ref(ring)] });
    const [copy] = tokens(game);
    expect(game.state.objects[copy].cardName).toBe("Sol Ring");
    expect(types(game, copy)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, copy)).toContain("Fractal");
    expect(counters(game, copy)).toBe(6);
    expect(pt(game, copy)).toEqual({ power: 6, toughness: 6 });
    // The original keeps none of it.
    expect(counters(game, ring)).toBe(0);
  });

  it("can't target an Aura or a permanent you don't control", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    const geometry = toHand(game, "Applied Geometry");
    expect(() => cast(game, geometry, { targets: [ref(theirs)] })).toThrow();
  });
});

describe("Procrastinate", () => {
  it("taps the creature and puts twice X stun counters on it", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Procrastinate"), { targets: [ref(giant)], x: 2 });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(4);
  });
});

describe("Hydro-Channeler", () => {
  it("makes mana only an instant or sorcery spell can spend", () => {
    const { game } = table();
    const channeler = spawn(game, "Hydro-Channeler");
    activate(game, channeler, 0);
    expect(game.state.players[A].manaPool).toHaveLength(1);
    // A creature spell can't spend it; an instant can.
    expect(() => cast(game, toHand(game, "Aegis Turtle"))).toThrow();
    const opt = toHand(game, "Opt");
    cast(game, opt);
    expect(zone(game, opt)).toBe("graveyard");
  });
});

describe("Jadzi, Steward of Fate // Oracle's Gift", () => {
  it("enters prepared and loots; its Oracle's Gift makes X Fractals and puts X counters on every Fractal", () => {
    const { game } = table();
    const older = spawn(game, "Fractal Token");
    game.state.objects[older].counters["+1/+1"] = 1;
    lands(game, "Island", 8);
    const card = toHand(game, "Jadzi, Steward of Fate");
    const before = hand(game).length;
    cast(game, card);
    const [jadzi] = named(game, "Jadzi, Steward of Fate");
    // Draw two, then discard two.
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game)).toHaveLength(2);
    expect(game.state.objects[jadzi].prepared).toBeDefined();
    const copy = preparedCopy(game)!;
    expect(game.state.objects[copy].cardName).toBe("Oracle's Gift");
    cast(game, copy, { via: "prepared", x: 2 });
    expect(game.state.objects[jadzi].prepared).toBeUndefined();
    const fractals = named(game, "Fractal Token");
    expect(fractals).toHaveLength(3);
    expect(fractals.filter((id) => id !== older).every((id) => counters(game, id) === 2)).toBe(true);
    expect(counters(game, older)).toBe(3);
  });
});

describe("Oracle's Restoration", () => {
  it("pumps your creature, draws a card and gains 1 life", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Oracle's Restoration"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(21);
  });
});

describe("Mica, Reader of Ruins", () => {
  it("copies an instant you cast when you sacrifice an artifact", () => {
    const { game, a } = table();
    spawn(game, "Mica, Reader of Ruins");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
  });

  it("copies nothing when you decline", () => {
    const { game, a } = table();
    spawn(game, "Mica, Reader of Ruins");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Mountain", 1);
    pickModes(a);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });
});

describe("Elite Interceptor // Rejoinder", () => {
  it("enters prepared; Rejoinder may untap the target, and draws a card", () => {
    const { game, a } = table();
    const interceptor = enterPrepared(game, "Elite Interceptor");
    const copy = preparedCopy(game)!;
    expect(game.state.objects[copy].cardName).toBe("Rejoinder");
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    lands(game, "Plains", 2);
    const before = hand(game).length;
    pickModes(a, 1);
    cast(game, copy, { via: "prepared", targets: [ref(giant)] });
    expect(game.state.objects[interceptor].prepared).toBeUndefined();
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Leech Collector // Bloodletting", () => {
  it("becomes prepared the first time you gain life each turn; Bloodletting drains each opponent", () => {
    const { game } = table();
    const collector = spawn(game, "Leech Collector");
    const foods = [spawn(game, "Food Token"), spawn(game, "Food Token")];
    lands(game, "Wastes", 4);
    expect(preparedCopy(game)).toBeUndefined();
    activate(game, foods[0], 0);
    expect(life(game, A)).toBe(23);
    expect(game.state.objects[collector].prepared).toBeDefined();
    const copy = preparedCopy(game)!;
    expect(game.state.objects[copy].cardName).toBe("Bloodletting");
    lands(game, "Swamp", 1);
    cast(game, copy, { via: "prepared" });
    expect(game.state.objects[collector].prepared).toBeUndefined();
    expect(life(game, B)).toBe(18);
    // A second gain this turn doesn't prepare it again.
    activate(game, foods[1], 0);
    expect(life(game, A)).toBe(26);
    expect(game.state.turn.number).toBe(1);
    expect(game.state.objects[collector].prepared).toBeUndefined();
  });
});

describe("Mikey & Leo, Chaos & Order", () => {
  it("draws once a turn when you put a counter on a creature you control, not when an opponent does", () => {
    const { game } = table();
    spawn(game, "Mikey & Leo, Chaos & Order");
    const bears = spawn(game, "Grizzly Bears");
    const put = (by: PlayerId, kind: string): void => {
      game.debugApplyEffect(by, { kind: "add-counter", target: 0, counter: kind, amount: 1 }, [ref(bears)]);
      settle(game);
    };
    const before = hand(game).length;
    put(B, "+1/+1");
    expect(hand(game).length).toBe(before);
    put(A, "stun");
    expect(hand(game).length).toBe(before + 1);
    put(A, "+1/+1");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Chrome Dome", () => {
  it("pumps other artifact creatures and makes a hasty token copy that's sacrificed at the end step", () => {
    const { game } = table();
    const dome = spawn(game, "Chrome Dome");
    const thopter = spawn(game, "Ornithopter");
    expect(pt(game, dome)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 2 });
    lands(game, "Wastes", 10);
    // "Another" target artifact: not Chrome Dome itself.
    expect(() => activate(game, dome, 0, { targets: [ref(dome)] })).toThrow();
    activate(game, dome, 0, { targets: [ref(thopter)] });
    const [copy] = tokens(game);
    expect(game.state.objects[copy].cardName).toBe("Ornithopter");
    expect(keywords(game, copy).has("haste")).toBe(true);
    expect(pt(game, copy)).toEqual({ power: 1, toughness: 2 });
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[copy]?.zone ?? "gone").not.toBe("battlefield");
    expect(zone(game, thopter)).toBe("battlefield");
  });
});

describe("Ravenous Robots", () => {
  it("makes a Robot for each artifact spell you cast, and gives your creature tokens haste", () => {
    const { game } = table();
    const robots = spawn(game, "Ravenous Robots");
    cast(game, toHand(game, "Memnite"));
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Robot Token (Big Mother Mouser)", A)).toBe(1);
    lands(game, "Mountain", 1);
    activate(game, robots, 0);
    const [robot] = tokens(game);
    expect(keywords(game, robot).has("haste")).toBe(true);
    expect(keywords(game, named(game, "Memnite")[0]).has("haste")).toBe(false);
  });
});

describe("Slash, Reptile Rampager", () => {
  it("deals 2 to each opponent as another creature enters, its own attack's Mutant included", () => {
    const { game, a } = table();
    const slash = spawn(game, "Slash, Reptile Rampager");
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(18);
    attack(game, a, [slash]);
    expect(tokensNamed(game, "Mutant Token", A)).toBe(1);
    const [mutant] = named(game, "Mutant Token");
    expect(pt(game, mutant)).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(18 - 2 - 7);
  });
});

describe("Lita, Little Orphan Amphibian", () => {
  it("chooses a different mode for each creature that enters, and nothing past the third", () => {
    const { game, a } = table();
    const lita = spawn(game, "Lita, Little Orphan Amphibian");
    const offered: number[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push(texts.length);
      return [0];
    };
    enter(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    expect(offered).toEqual([3, 2, 1]);
    expect(counters(game, lita)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});
