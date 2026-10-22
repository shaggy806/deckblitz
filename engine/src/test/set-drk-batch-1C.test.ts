/**
 * The Dark, batch 1, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Venom", () => {
  it("destroys a non-Wall creature blocking the enchanted creature at end of combat", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Venom"), { targets: [ref(bears)] });
    const wurm = spawn(game, "Craw Wurm", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("leaves a Wall that blocks it alone", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Venom"), { targets: [ref(bears)] });
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, wall)).toBe("battlefield");
  });

  it("destroys the attacker the enchanted creature blocks", () => {
    const { game, a, b } = table();
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Venom"), { targets: [ref(blocker)] });
    const wurm = spawn(game, "Craw Wurm");
    b.declareBlockersFn = () => [{ blocker, attacker: wurm }];
    attack(game, a, [wurm]);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("War Barge", () => {
  it("destroys the creature when War Barge leaves the battlefield that turn", () => {
    const { game } = table();
    const barge = spawn(game, "War Barge");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    activate(game, barge, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, barge);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("does nothing when War Barge leaves on a later turn", () => {
    const { game } = table();
    const barge = spawn(game, "War Barge");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    activate(game, barge, 0, { targets: [ref(bears)] });
    nextTurn(game);
    destroy(game, barge);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Banshee", () => {
  it("deals half X rounded down to the target and half X rounded up to you", () => {
    const { game } = table();
    const banshee = spawn(game, "Banshee");
    lands(game, "Wastes", 5);
    activate(game, banshee, 0, { targets: [ref(B)], x: 5 });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(17);
  });
});

describe("Eater of the Dead", () => {
  it("does nothing while untapped", () => {
    const { game } = table();
    const eater = spawn(game, "Eater of the Dead");
    const corpse = toGraveyard(game, "Grizzly Bears", B);
    activate(game, eater, 0, { targets: [ref(corpse)] });
    expect(zone(game, corpse)).toBe("graveyard");
  });

  it("exiles the card and untaps itself while tapped", () => {
    const { game } = table();
    const eater = spawn(game, "Eater of the Dead", A, { tapped: true });
    const corpse = toGraveyard(game, "Grizzly Bears", B);
    activate(game, eater, 0, { targets: [ref(corpse)] });
    expect(zone(game, corpse)).toBe("exile");
    expect(tapped(game, eater)).toBe(false);
  });
});

describe("Angry Mob", () => {
  it("counts opponents' Swamps during its controller's turn and is 2/2 otherwise", () => {
    const { game } = table();
    const mob = spawn(game, "Angry Mob");
    lands(game, "Swamp", 2, B);
    lands(game, "Swamp", 1, A);
    expect(pt(game, mob)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(pt(game, mob)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Goblin Shrine", () => {
  it("pumps every Goblin while on a basic Mountain, and pings each Goblin as it leaves", () => {
    const { game } = table();
    const [mountain] = lands(game, "Mountain", 3);
    const goblin = spawn(game, "Raging Goblin", B);
    const shrine = toHand(game, "Goblin Shrine");
    cast(game, shrine, { targets: [ref(mountain)] });
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 1 });
    destroy(game, shrine);
    expect(zone(game, goblin)).toBe("graveyard");
  });
});

describe("Festival", () => {
  it("can't be cast on your own turn", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    expect(() => cast(game, toHand(game, "Festival"))).toThrow();
  });

  const attackersOffered = (withFestival: boolean): readonly ObjectId[] => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    const festival = toHand(game, "Festival");
    game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === B && s.priority.holder === A);
    if (withFestival) cast(game, festival);
    let eligible: readonly ObjectId[] = [];
    b.declareAttackersFn = () => {
      const offer = game
        .legalActions(B)
        .find((o): o is Extract<LegalAction, { kind: "declare-attackers" }> => o.kind === "declare-attackers");
      eligible = offer?.eligible ?? [];
      return [];
    };
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && activePlayerOf(s) === B);
    return eligible.filter((id) => id === bears);
  };

  it("stops creatures attacking that turn when cast in an opponent's upkeep", () => {
    expect(attackersOffered(false)).toHaveLength(1);
    expect(attackersOffered(true)).toHaveLength(0);
  });
});

describe("Miracle Worker", () => {
  it("destroys an Aura on a creature you control, never one on an opponent's", () => {
    const { game } = table();
    const worker = spawn(game, "Miracle Worker");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    const onMine = toHand(game, "Pacifism");
    cast(game, onMine, { targets: [ref(mine)] });
    const onTheirs = toHand(game, "Pacifism");
    cast(game, onTheirs, { targets: [ref(theirs)] });
    expect(() => activate(game, worker, 0, { targets: [ref(onTheirs)] })).toThrow();
    activate(game, worker, 0, { targets: [ref(onMine)] });
    expect(zone(game, onMine)).toBe("graveyard");
  });
});

describe("People of the Woods", () => {
  it("has toughness equal to the Forests you control", () => {
    const { game } = table();
    const people = spawn(game, "People of the Woods");
    lands(game, "Forest", 3);
    lands(game, "Forest", 2, B);
    expect(pt(game, people)).toEqual({ power: 1, toughness: 3 });
  });
});
