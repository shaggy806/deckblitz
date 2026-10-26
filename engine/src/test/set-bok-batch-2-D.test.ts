import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickTargets,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("BOK-CHK batch 2, group D", () => {
  it("Empty-Shrine Kannushi has protection from white by itself, and from red once you control a red permanent", () => {
    const { game } = table();
    const kannushi = spawn(game, "Empty-Shrine Kannushi");
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    const shockIt = { type: "cast-spell", player: A, card: shock, targets: [ref(kannushi)] } as const;
    expect(game.canDispatch(shockIt)).toBeNull();
    spawn(game, "Goblin Cohort");
    expect(game.canDispatch(shockIt)).not.toBeNull();
  });

  it("Horobi, Death's Wail destroys a creature that becomes the target of a spell", () => {
    const { game } = table();
    spawn(game, "Horobi, Death's Wail", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Myojin of Life's Web cast from hand is indestructible, and its counter puts creatures from hand onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 9);
    const myojin = toHand(game, "Myojin of Life's Web");
    cast(game, myojin);
    expect(zone(game, myojin)).toBe("battlefield");
    expect(counters(game, myojin, "divinity")).toBe(1);
    expect(keywords(game, myojin).has("indestructible")).toBe(true);
    const bears = toHand(game, "Grizzly Bears");
    const kami = toHand(game, "Kami of Tattered Shoji");
    const forest = toHand(game, "Forest");
    const seen = pickFromZone(a, bears, kami);
    activate(game, myojin, 0);
    expect(seen.offered).not.toContain(forest);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, kami)).toBe("battlefield");
    expect(counters(game, myojin, "divinity")).toBe(0);
    expect(keywords(game, myojin).has("indestructible")).toBe(false);
  });

  it("Through the Breach puts a creature onto the battlefield with haste and sacrifices it at the end step", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const bears = toHand(game, "Grizzly Bears");
    pickFromZone(a, bears);
    cast(game, toHand(game, "Through the Breach"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Takeno's Cavalry can't target a Spirit that isn't attacking or blocking", () => {
    const { game } = table();
    const cavalry = spawn(game, "Takeno's Cavalry");
    const kami = spawn(game, "Kami of Tattered Shoji", B);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: cavalry, abilityIndex: 0, targets: [ref(kami)] }),
    ).not.toBeNull();
  });

  it("Scourge of Numai costs 2 life each upkeep unless you control an Ogre", () => {
    const { game } = table();
    spawn(game, "Scourge of Numai");
    const before = life(game);
    toStep(game, "precombat-main");
    expect(life(game)).toBe(before - 2);
    spawn(game, "Takenuma Bleeder");
    toStep(game, "precombat-main");
    expect(life(game)).toBe(before - 2);
  });

  it("Sire of the Storm may draw when you cast an Arcane spell", () => {
    const { game, a } = table();
    spawn(game, "Sire of the Storm");
    lands(game, "Island", 2);
    a.chooseModesFn = () => [0];
    pickFromZone(a);
    pickTargets(a);
    const peer = toHand(game, "Peer Through Depths");
    const before = hand(game).length;
    cast(game, peer);
    // Peer leaves hand (-1), Sire draws (+1), Peer finds no instant or sorcery among Wastes.
    expect(hand(game).length).toBe(before);
  });
});
