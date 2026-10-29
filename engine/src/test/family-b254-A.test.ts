import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
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
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const offersOf = (game: Game, source: ObjectId, player = A): ActivateOffer[] =>
  game
    .legalActions(player)
    .filter((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source);

const setCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters[kind] = n;
};

describe("Koma, Cosmos Serpent", () => {
  it("makes a Coil each upkeep, and its first mode taps and locks a permanent this turn", () => {
    const { game } = table();
    const koma = spawn(game, "Koma, Cosmos Serpent");
    lands(game, "Wastes", 2);
    const wall = spawn(game, "Amaranthine Wall");
    const coil = spawn(game, "Koma's Coil");
    expect(offersOf(game, wall)).not.toHaveLength(0);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: koma,
      abilityIndex: 0,
      modes: [0],
      targets: [ref(wall)],
      sacrifice: coil,
    } as Action);
    settle(game);
    expect(zone(game, coil)).not.toBe("battlefield");
    expect(game.state.objects[wall].tapped).toBe(true);
    expect(offersOf(game, wall)).toHaveLength(0);
    nextTurn(game);
    expect(tokensNamed(game, "Koma's Coil", A)).toBe(1);
  });
});

describe("Cayth, Famed Mechanist", () => {
  it("gives another nontoken creature fabricate 1, and has its own once", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const cayth = enter(game, "Cayth, Famed Mechanist");
    expect(counters(game, cayth)).toBe(1);
    const bear = enter(game, "Grizzly Bears");
    expect(counters(game, bear)).toBe(1);
    pickModes(a, 1);
    enter(game, "Hill Giant");
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
  });
});

describe("Empty the Laboratory", () => {
  it("reveals until as many Zombie creature cards as Zombies were sacrificed", () => {
    const { game } = table();
    spawn(game, "Walking Corpse");
    spawn(game, "Walking Corpse");
    toLibrary(game, "Walking Corpse");
    toLibrary(game, "Wastes");
    toLibrary(game, "Walking Corpse");
    lands(game, "Island", 5);
    const spell = toHand(game, "Empty the Laboratory");
    cast(game, spell, { x: 2 });
    expect(named(game, "Walking Corpse").filter((id) => zone(game, id) === "battlefield")).toHaveLength(2);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Walking Corpse")).toHaveLength(2);
  });
});

describe("Retribution of the Ancients", () => {
  it("gives -X/-X for the X counters removed from among your creatures", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const retribution = spawn(game, "Retribution of the Ancients");
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, bear, "+1/+1", 3);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, retribution, 0, { x: 2, targets: [ref(giant)] });
    expect(counters(game, bear)).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Flitterwing Nuisance", () => {
  it("draws for each creature that deals combat damage to a player this turn", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const nuisance = spawn(game, "Flitterwing Nuisance");
    setCounters(game, nuisance, "-1/-1", 1);
    activate(game, nuisance, 0);
    expect(counters(game, nuisance, "-1/-1")).toBe(0);
    const bear = spawn(game, "Grizzly Bears");
    const bear2 = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [bear, bear2]);
    expect(hand(game)).toHaveLength(before + 2);
  });
});

describe("Smokestack", () => {
  it("makes the player whose upkeep it is sacrifice one permanent per soot counter", () => {
    const { game } = table();
    const stack = spawn(game, "Smokestack");
    setCounters(game, stack, "soot", 2);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(named(game, "Grizzly Bears", B).filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
    expect(zone(game, stack)).toBe("battlefield");
  });
});

describe("Overseer of Vault 76", () => {
  it("counts itself and small creatures, then spends exactly three quest counters", () => {
    const { game, a } = table();
    const overseer = enter(game, "Overseer of Vault 76");
    const bear = enter(game, "Grizzly Bears");
    enter(game, "Hill Giant");
    const wurm = enter(game, "Colossal Dreadmaw");
    expect(counters(game, overseer, "quest")).toBe(3);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, overseer, "quest")).toBe(0);
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, wurm)).toBe(1);
    expect(keywords(game, bear).has("vigilance")).toBe(true);
  });

  it("does nothing more with fewer than three to remove", () => {
    const { game, a } = table();
    const overseer = spawn(game, "Overseer of Vault 76");
    setCounters(game, overseer, "quest", 2);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, overseer)).toBe(0);
  });
});

describe("Stuck in Summoner's Sanctum", () => {
  it("enchants an artifact, taps it and keeps it tapped", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const ring = spawn(game, "Sol Ring", B);
    const aura = toHand(game, "Stuck in Summoner's Sanctum");
    cast(game, aura, { targets: [ref(ring)] });
    expect(game.state.objects[aura].attachedTo).toBe(ring);
    expect(game.state.objects[ring].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[ring].tapped).toBe(true);
  });
});

describe("Survivor's Med Kit", () => {
  it("offers only the modes not chosen yet, and RadAway sacrifices it", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const kit = spawn(game, "Survivor's Med Kit");
    const before = hand(game).length;
    activate(game, kit, 0, { modes: [0] });
    expect(hand(game)).toHaveLength(before + 1);
    nextTurn(game);
    nextTurn(game);
    expect(offersOf(game, kit).map((o) => o.modes)).toEqual([[1], [2]]);
    activate(game, kit, 0, { modes: [2], targets: [ref(B)] });
    expect(zone(game, kit)).toBe("graveyard");
  });
});

describe("The Filigree Sylex", () => {
  it("removes ten oil counters from among your permanents to deal 10 damage", () => {
    const { game, a } = table();
    const sylex = spawn(game, "The Filigree Sylex");
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, sylex, "oil", 6);
    setCounters(game, bear, "oil", 3);
    expect(offersOf(game, sylex).filter((o) => o.abilityIndex === 2)).toHaveLength(0);
    setCounters(game, bear, "oil", 4);
    a.chooseCounterRemovalsFn = () => [
      { object: sylex, kind: "oil", count: 6 },
      { object: bear, kind: "oil", count: 4 },
    ];
    activate(game, sylex, 2, { targets: [ref(B)] });
    expect(life(game, B)).toBe(10);
    expect(zone(game, sylex)).toBe("graveyard");
    expect(counters(game, bear, "oil")).toBe(0);
  });

  it("destroys each nonland permanent with mana value equal to its oil counters", () => {
    const { game } = table();
    const sylex = spawn(game, "The Filigree Sylex");
    setCounters(game, sylex, "oil", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, sylex, 1);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Skinshifter", () => {
  it("becomes only a 4/4 trampling Rhino, once a turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const shifter = spawn(game, "Skinshifter");
    activate(game, shifter, 0, { modes: [0] });
    expect(pt(game, shifter)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, shifter).has("trample")).toBe(true);
    expect(subtypes(game, shifter)).toEqual(["Rhino"]);
    expect(offersOf(game, shifter)).toHaveLength(0);
  });
});

describe("Ice Cage", () => {
  it("is destroyed when the enchanted creature becomes a target", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const cage = spawn(game, "Ice Cage");
    game.state.objects[cage].attachedTo = giant;
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(giant)] });
    expect(zone(game, cage)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});
