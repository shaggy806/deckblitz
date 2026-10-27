import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

// Darksteel (DST), batch 214 group E.

const attach = (game: Game, equipment: ObjectId, onto: ObjectId): void => {
  game.debugApplyEffect(game.state.objects[equipment].controller, { kind: "attach", target: 0 }, [ref(onto)], {
    source: equipment,
  });
  settle(game);
};

describe("Wirefly Hive", () => {
  it("a won flip makes a Wirefly; a lost one destroys every permanent named Wirefly", () => {
    const { game } = table();
    const hive = spawn(game, "Wirefly Hive");
    spawn(game, "Wirefly Token", B);
    lands(game, "Wastes", 60);
    let sawWin = false;
    let sawLoss = false;
    for (let i = 0; i < 15 && !(sawWin && sawLoss); i++) {
      const before = tokensNamed(game, "Wirefly Token", A);
      const flipsBefore = game.eventsOfType("coin-flipped").length;
      game.state.objects[hive].tapped = false;
      activate(game, hive, 0);
      const flips = game.eventsOfType("coin-flipped");
      expect(flips.length).toBe(flipsBefore + 1);
      if (flips[flips.length - 1].won) {
        sawWin = true;
        expect(tokensNamed(game, "Wirefly Token", A)).toBe(before + 1);
      } else {
        sawLoss = true;
        expect(tokensNamed(game, "Wirefly Token")).toBe(0);
      }
    }
    expect(sawWin && sawLoss).toBe(true);
  });
});

describe("Carry Away", () => {
  it("takes control of the Equipment and unattaches it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const plate = spawn(game, "Darksteel Plate", B);
    attach(game, plate, bears);
    expect(game.state.objects[plate].attachedTo).toBe(bears);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Carry Away"), { targets: [ref(plate)] });
    expect(controller(game, plate)).toBe(A);
    expect(game.state.objects[plate].attachedTo).toBeNull();
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });
});

describe("Psychic Overload", () => {
  it("taps the permanent, keeps it tapped, and grants a discard-two-artifacts untap", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Psychic Overload"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    toStep(game, "precombat-main", A);
    expect(game.state.objects[bears].tapped).toBe(true);
    const sol = toHand(game, "Sol Ring");
    const thopter = toHand(game, "Ornithopter");
    toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    pickFromZone(a, sol, thopter);
    activate(game, bears, 0);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(hand(game).length).toBe(before - 2);
    expect(zone(game, sol)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("graveyard");
  });
});

describe("Karstoderm", () => {
  it("enters with five counters and loses one whenever an artifact enters", () => {
    const { game } = table();
    const derm = enter(game, "Karstoderm");
    expect(counters(game, derm)).toBe(5);
    enter(game, "Sol Ring", B);
    expect(counters(game, derm)).toBe(4);
  });
});

describe("Shield of Kaldra", () => {
  it("gives Kaldra Equipment indestructible, and the equipped creature", () => {
    const { game } = table();
    const shield = spawn(game, "Shield of Kaldra");
    const helm = spawn(game, "Helm of Kaldra", B);
    const plate = spawn(game, "Bonesplitter", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, shield).has("indestructible")).toBe(true);
    expect(keywords(game, helm).has("indestructible")).toBe(true);
    expect(keywords(game, plate).has("indestructible")).toBe(false);
    attach(game, shield, bears);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Furnace Dragon", () => {
  it("costs {1} less per artifact, and cast from hand exiles all artifacts", () => {
    const { game } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    const theirs = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 5);
    const dragon = toHand(game, "Furnace Dragon");
    cast(game, dragon);
    expect(zone(game, dragon)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("exile");
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Ornithopter")).toHaveLength(0);
  });

  it("entering without being cast exiles nothing", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    enter(game, "Furnace Dragon");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Oxidda Golem", () => {
  it("costs {1} less for each Mountain you control", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const golem = toHand(game, "Oxidda Golem");
    cast(game, golem);
    expect(zone(game, golem)).toBe("battlefield");
  });
});

describe("Synod Artificer", () => {
  it("taps X target noncreature artifacts, and can't target an artifact creature", () => {
    const { game } = table();
    const artificer = spawn(game, "Synod Artificer");
    const r1 = spawn(game, "Sol Ring", B);
    const r2 = spawn(game, "Sol Ring", B);
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Wastes", 2);
    const withThopter = {
      type: "activate-ability",
      player: A,
      source: artificer,
      abilityIndex: 0,
      targets: [ref(r1), ref(thopter)],
      xValue: 2,
    } as const;
    expect(game.canDispatch(withThopter)).not.toBeNull();
    activate(game, artificer, 0, { x: 2, targets: [ref(r1), ref(r2)] });
    expect(game.state.objects[r1].tapped).toBe(true);
    expect(game.state.objects[r2].tapped).toBe(true);
  });
});

describe("Machinate", () => {
  it("looks at as many cards as you control artifacts and takes one", () => {
    const { game, a } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    const deep = toLibrary(game, "Grizzly Bears");
    const top = toLibrary(game, "Island");
    lands(game, "Island", 3);
    const before = hand(game).length;
    const seen = pickFromZone(a, deep);
    cast(game, toHand(game, "Machinate"));
    expect(hand(game).length).toBe(before + 1);
    expect(seen.offered).toHaveLength(2);
    expect(zone(game, deep)).toBe("hand");
    expect(zone(game, top)).toBe("library");
  });
});

describe("Wand of the Elements", () => {
  it("sacrificing an Island makes a 2/2 flier; a Mountain a 3/3", () => {
    const { game } = table();
    const wand = spawn(game, "Wand of the Elements");
    const island = spawn(game, "Island");
    game.dispatch({ type: "activate-ability", player: A, source: wand, abilityIndex: 0, targets: [], sacrifice: island });
    settle(game);
    expect(zone(game, island)).toBe("graveyard");
    expect(tokensNamed(game, "2/2 Blue Elemental Token (Flying)", A)).toBe(1);
    game.state.objects[wand].tapped = false;
    const mountain = spawn(game, "Mountain");
    game.dispatch({ type: "activate-ability", player: A, source: wand, abilityIndex: 1, targets: [], sacrifice: mountain });
    settle(game);
    expect(zone(game, mountain)).toBe("graveyard");
    expect(tokensNamed(game, "3/3 Red Elemental Token", A)).toBe(1);
  });
});

describe("Wurm's Tooth", () => {
  it("gains 1 life when a player casts a green spell", () => {
    const { game, a } = table();
    spawn(game, "Wurm's Tooth");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game)).toBe(21);
  });
});
