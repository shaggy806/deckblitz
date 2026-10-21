/**
 * Limited Edition Alpha, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  destroy,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Bad Moon", () => {
  it("pumps every black creature, an opponent's too, and nothing else", () => {
    const { game } = table();
    spawn(game, "Bad Moon");
    const mine = spawn(game, "Vampire Nighthawk");
    const theirs = spawn(game, "Hypnotic Specter", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Icy Manipulator", () => {
  it("taps a land, and can't target an enchantment", () => {
    const { game } = table();
    const icy = spawn(game, "Icy Manipulator");
    lands(game, "Wastes", 1);
    const forest = spawn(game, "Forest", B);
    const moon = spawn(game, "Bad Moon", B);
    const at = (target: ObjectId): Action =>
      ({ type: "activate-ability", player: A, source: icy, abilityIndex: 0, targets: [ref(target)] }) as Action;
    expect(game.canDispatch(at(moon))).not.toBeNull();
    activate(game, icy, 0, { targets: [ref(forest)] });
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Howl from Beyond", () => {
  it("gives +X/+0", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Howl from Beyond"), { x: 3, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });
});

describe("Living Lands", () => {
  it("makes every Forest a 1/1 creature land, and no other land", () => {
    const { game } = table();
    spawn(game, "Living Lands");
    const mine = spawn(game, "Forest");
    const theirs = spawn(game, "Forest", B);
    const plains = spawn(game, "Plains");
    for (const forest of [mine, theirs]) {
      expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
      expect(pt(game, forest)).toEqual({ power: 1, toughness: 1 });
    }
    expect(types(game, plains)).not.toContain("creature");
  });
});

describe("Tsunami", () => {
  it("destroys every Island and nothing else", () => {
    const { game } = table();
    const islands = [spawn(game, "Island"), spawn(game, "Island", B)];
    const plains = spawn(game, "Plains", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Tsunami"));
    for (const island of islands) expect(zone(game, island)).toBe("graveyard");
    expect(zone(game, plains)).toBe("battlefield");
  });
});

describe("Healing Salve", () => {
  it("gives target player 3 life", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    game.state.players[B].life = 10;
    cast(game, toHand(game, "Healing Salve"), { modes: [0], targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
  });

  it("prevents the next 3 damage to a creature", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Healing Salve"), { modes: [1], targets: [ref(giant)] });
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(giant)]);
    settle(game);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("Lifetap", () => {
  it("gains 1 life for each opponent's Forest that becomes tapped, not its controller's own", () => {
    const { game } = table();
    spawn(game, "Lifetap");
    spawn(game, "Forest", B);
    spawn(game, "Forest", B);
    spawn(game, "Forest");
    spawn(game, "Plains", B);
    game.debugApplyEffect(B, { kind: "tap-all", filter: { type: "land" } }, []);
    settle(game);
    expect(life(game)).toBe(22);
  });
});

describe("Psychic Venom", () => {
  it("deals 2 damage to the enchanted land's controller when it becomes tapped", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", B);
    const venom = spawn(game, "Psychic Venom");
    game.state.objects[venom].attachedTo = forest;
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(forest)]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(20);
  });
});

describe("Throne of Bone", () => {
  it("gains 1 life for {1} when a black spell is cast", () => {
    const { game, a } = table();
    spawn(game, "Throne of Bone");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Dark Ritual"));
    expect(life(game)).toBe(21);
  });
});

describe("Soul Net", () => {
  it("gains 1 life for {1} when any creature dies, and nothing if you decline", () => {
    const { game, a } = table();
    spawn(game, "Soul Net");
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(life(game)).toBe(21);
    pickModes(a);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(life(game)).toBe(21);
  });
});

describe("Cockatrice", () => {
  it("destroys a non-Wall creature it blocks at end of combat", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const cockatrice = spawn(game, "Cockatrice", B);
    b.declareBlockersFn = () => [{ blocker: cockatrice, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("destroys a non-Wall creature blocking it, but not a Wall", () => {
    const { game, a, b } = table();
    const cockatrice = spawn(game, "Cockatrice");
    // Blockers that can block a flier: a reach Spider, a flying Wall.
    const spider = spawn(game, "Giant Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: cockatrice }];
    attack(game, a, [cockatrice]);
    expect(zone(game, spider)).toBe("graveyard");

    const second = table();
    const other = spawn(second.game, "Cockatrice");
    const wall = spawn(second.game, "Wall of Air", B);
    second.b.declareBlockersFn = () => [{ blocker: wall, attacker: other }];
    attack(second.game, second.a, [other]);
    expect(life(second.game, B)).toBe(20); // the Wall did block
    expect(zone(second.game, wall)).toBe("battlefield");
  });
});

describe("Warp Artifact", () => {
  it("deals 1 damage at the upkeep of the enchanted artifact's controller only", () => {
    const { game } = table();
    const icy = spawn(game, "Icy Manipulator", B);
    const warp = spawn(game, "Warp Artifact");
    game.state.objects[warp].attachedTo = icy;
    toStep(game, "draw");
    // Bob's upkeep (turn 2), then alice's (turn 3).
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(20);
  });
});

describe("Farmstead", () => {
  it("lets the enchanted land's controller pay {W}{W} at their upkeep for 1 life", () => {
    const { game, a } = table();
    const plains = spawn(game, "Plains");
    lands(game, "Plains", 2);
    const farmstead = spawn(game, "Farmstead");
    game.state.objects[farmstead].attachedTo = plains;
    pickModes(a, 0);
    toStep(game, "draw");
    expect(life(game)).toBe(21);
  });
});

describe("Ironclaw Orcs", () => {
  it("can't block a creature with power 2 or greater", () => {
    const { game, a } = table();
    const orcs = spawn(game, "Ironclaw Orcs", B);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    blockOffer(game, a, [bears, elves]);
    expect(whyCannotBlock(game.state, game.registry, B, orcs, bears)).not.toBeNull();
    expect(whyCannotBlock(game.state, game.registry, B, orcs, elves)).toBeNull();
  });
});

describe("Phantasmal Forces", () => {
  it("is sacrificed at your upkeep unless you pay {U}", () => {
    const { game, a } = table();
    const forces = spawn(game, "Phantasmal Forces");
    pickModes(a);
    toStep(game, "draw");
    expect(zone(game, forces)).toBe("graveyard");
  });
});
