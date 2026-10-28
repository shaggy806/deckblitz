/**
 * B249 group A — cards freed by the static loss of all abilities, block limits
 * and type-setting effects: Auras that set a creature's types, colours and base
 * P/T beside the loss, the `blockAdditional` statics and effect, and
 * `add-types`' setTypes / setSubtypes.
 */
import { describe, expect, it } from "vitest";

import { effectiveColors } from "../characteristics.js";
import { goadersOf } from "../goad.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  controller,
  destroy,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  registryOf,
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
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();

const unsick = (game: Game, ...ids: ObjectId[]): void => {
  for (const id of ids) game.state.objects[id].summoningSick = false;
};

/** The texts of the abilities `id`'s controller (alice) may activate now. */
const activatable = (game: Game, id: ObjectId): string[] => [
  ...new Set(
    game
      .legalActions(A)
      .flatMap((action) =>
        action.kind === "activate-ability" && action.source === id ? [action.text.replace(/ \(add \{.\}\)$/, "")] : [],
      ),
  ),
];

const maxBlocks = (game: Game, blocker: ObjectId, attackers: readonly ObjectId[]): number | undefined => {
  const { a } = seats.get(game)!;
  return blockOffer(game, a, attackers).eligible.find((e) => e.blocker === blocker)?.maxBlocks;
};
const seats = new WeakMap<Game, ReturnType<typeof table>>();
const newTable = (opts?: Parameters<typeof table>[0]): ReturnType<typeof table> => {
  const t = table(opts);
  seats.set(t.game, t);
  return t;
};
const bears = (game: Game, n: number): ObjectId[] => {
  const ids = Array.from({ length: n }, () => spawn(game, "Grizzly Bears", A));
  unsick(game, ...ids);
  return ids;
};

describe("Auras that set what the creature is", () => {
  it("Darksteel Mutation: an indestructible 0/1 Insect artifact creature, its colour kept", () => {
    const { game } = newTable();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Darksteel Mutation"), { targets: [ref(angel)] });
    expect(types(game, angel)).toEqual(["artifact", "creature"]);
    expect(subtypes(game, angel)).toEqual(["Insect"]);
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 1 });
    expect([...keywords(game, angel)]).toEqual(["indestructible"]);
    expect(colorsOf(game, angel)).toEqual(["W"]);
  });

  it("Eaten by Piranhas: an artifact creature is a black 1/1 Skeleton creature only", () => {
    const { game } = newTable();
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Eaten by Piranhas"), { targets: [ref(thopter)] });
    expect(types(game, thopter)).toEqual(["creature"]);
    expect(subtypes(game, thopter)).toEqual(["Skeleton"]);
    expect(colorsOf(game, thopter)).toEqual(["B"]);
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 1 });
    expect([...keywords(game, thopter)]).toEqual([]);
  });

  it("Noggle the Mind: a colourless 1/1 Noggle, still only a creature", () => {
    const { game } = newTable();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Noggle the Mind"), { targets: [ref(angel)] });
    expect(types(game, angel)).toEqual(["creature"]);
    expect(subtypes(game, angel)).toEqual(["Noggle"]);
    expect(colorsOf(game, angel)).toEqual([]);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect([...keywords(game, angel)]).toEqual([]);
  });

  it("Eye of Nidhogg: a goaded black 4/2 Dragon with flying and deathtouch; it comes back to hand", () => {
    const { game } = newTable();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    const eye = toHand(game, "Eye of Nidhogg");
    cast(game, eye, { targets: [ref(bear)] });
    expect(subtypes(game, bear)).toEqual(["Dragon"]);
    expect(colorsOf(game, bear)).toEqual(["B"]);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    expect([...keywords(game, bear)].sort()).toEqual(["deathtouch", "flying"]);
    expect(goadersOf(game.state, registryOf(game), bear)).toEqual([A]);
    destroy(game, eye);
    expect(zone(game, eye)).toBe("hand");
    expect(goadersOf(game.state, registryOf(game), bear)).toEqual([]);
  });

  it("Sugar Coat: a creature is a colourless Food artifact that its controller can eat", () => {
    const { game } = newTable();
    const angel = spawn(game, "Serra Angel", A);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Sugar Coat"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(types(game, angel)).toEqual(["artifact"]);
    expect(subtypes(game, angel)).toEqual(["Food"]);
    expect(colorsOf(game, angel)).toEqual([]);
    expect(activatable(game, angel)).toEqual([]); // no mana left
    lands(game, "Wastes", 2);
    expect(activatable(game, angel)).toEqual(["{2}, {T}, Sacrifice this artifact: You gain 3 life."]);
    const before = life(game);
    const action = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === angel);
    if (action === undefined || action.kind !== "activate-ability") throw new Error("no Food ability");
    activate(game, angel, action.abilityIndex);
    expect(zone(game, angel)).toBe("graveyard");
    expect(life(game)).toBe(before + 3);
  });

  it("Duskmourn's Domination: you control it, -3/-0 with no abilities", () => {
    const { game } = newTable();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Duskmourn's Domination"), { targets: [ref(angel)] });
    expect(controller(game, angel)).toBe(A);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 4 });
    expect([...keywords(game, angel)]).toEqual([]);
  });

  it("Stasis Field: a 0/2 with defender and nothing else", () => {
    const { game } = newTable();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Stasis Field"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 2 });
    expect([...keywords(game, angel)]).toEqual(["defender"]);
  });
});

describe("Ray of Frost", () => {
  it("a red creature is tapped and loses its abilities", () => {
    const { game } = newTable();
    const goblin = spawn(game, "Raging Goblin", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Ray of Frost"), { targets: [ref(goblin)] });
    expect(game.state.objects[goblin].tapped).toBe(true);
    expect([...keywords(game, goblin)]).toEqual([]);
  });

  it("a green one stays untapped and keeps them", () => {
    const { game } = newTable();
    const elves = spawn(game, "Llanowar Elves", A);
    unsick(game, elves);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Ray of Frost"), { targets: [ref(elves)] });
    expect(game.state.objects[elves].tapped).toBe(false);
    expect(activatable(game, elves)).toEqual(["{T}: Add {G}."]);
  });
});

describe("Shimmerwilds Growth", () => {
  it("the land is the chosen colour and adds one more mana of it", () => {
    const { game } = newTable();
    const wastes = spawn(game, "Wastes", A);
    lands(game, "Forest", 2);
    const growth = toHand(game, "Shimmerwilds Growth");
    game.dispatch({ type: "cast-spell", player: A, card: growth, targets: [ref(wastes)] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "R" });
    settle(game);
    expect(zone(game, growth)).toBe("battlefield");
    expect(colorsOf(game, wastes)).toEqual(["R"]);
    game.state.objects[wastes].tapped = false; // it may have paid for the Aura
    const action = game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === wastes);
    if (action === undefined || action.kind !== "activate-ability") throw new Error("no mana ability");
    activate(game, wastes, action.abilityIndex);
    const pool = game.state.players[A].manaPool.map((unit) => unit.type).sort();
    expect(pool).toEqual(["C", "R"]);
  });
});

describe("Poppet Stitcher // Poppet Factory", () => {
  it("makes decayed Zombies, transforms with three tokens, and the Factory's tokens are 3/3 with no abilities", () => {
    const { game, a } = newTable();
    const stitcher = spawn(game, "Poppet Stitcher", A);
    lands(game, "Mountain", 3);
    for (let i = 0; i < 3; i++) cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Zombie Token (Crowded Crypt)", A)).toBe(3);
    const zombie = game.battlefield.find((id) => game.state.objects[id].cardName === "Zombie Token (Crowded Crypt)")!;
    expect(keywords(game, zombie)).toContain("decayed");
    pickModes(a, 0);
    toStep(game, "draw");
    expect(game.state.objects[stitcher].face).toBe(1);
    expect(types(game, stitcher)).toEqual(["artifact"]);
    const zombies = game.battlefield.filter((id) => game.state.objects[id].cardName === "Zombie Token (Crowded Crypt)");
    for (const id of zombies) {
      expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
      expect([...keywords(game, id)]).toEqual([]);
    }
  });

  it("doesn't offer to transform with fewer than three creature tokens", () => {
    const { game, a } = newTable();
    const stitcher = spawn(game, "Poppet Stitcher", A);
    lands(game, "Mountain", 2);
    for (let i = 0; i < 2; i++) cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    pickModes(a, 0);
    toStep(game, "draw");
    expect(game.state.objects[stitcher].face ?? 0).toBe(0);
  });
});

describe("Hydro-Man, Fluid Felon", () => {
  it("gets +1/+1 for a blue spell while a creature", () => {
    const { game } = newTable();
    const hydro = spawn(game, "Hydro-Man, Fluid Felon", A);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(pt(game, hydro)).toEqual({ power: 3, toughness: 3 });
  });

  it("at his end step he untaps and is a land that taps for {U}, summoning sick or not, until his next turn", () => {
    const { game } = newTable();
    const hydro = spawn(game, "Hydro-Man, Fluid Felon", A, { sick: true, tapped: true });
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[hydro].tapped).toBe(false);
    expect(types(game, hydro)).toEqual(["land"]);
    expect(subtypes(game, hydro)).toEqual([]);
    expect(activatable(game, hydro)).toEqual(["{T}: Add {U}."]);
    toStep(game, "upkeep");
    expect(types(game, hydro)).toEqual(["creature"]);
    expect(activatable(game, hydro)).toEqual([]);
  });
});

describe("block limits", () => {
  it("Cenn's Tactician: only a creature with a +1/+1 counter blocks one more", () => {
    const { game } = newTable();
    const tactician = spawn(game, "Cenn's Tactician", B);
    const plain = spawn(game, "Grizzly Bears", B);
    const countered = spawn(game, "Grizzly Bears", B);
    game.state.objects[countered].counters["+1/+1"] = 1;
    const attackers = bears(game, 3);
    const offer = blockOffer(game, seats.get(game)!.a, attackers);
    expect(offer.eligible.find((e) => e.blocker === countered)?.maxBlocks).toBe(2);
    expect(offer.eligible.find((e) => e.blocker === plain)?.maxBlocks).toBeUndefined();
    expect(offer.eligible.find((e) => e.blocker === tactician)?.maxBlocks).toBeUndefined();
  });

  it("Cenn's Tactician's counter goes on a Soldier only", () => {
    const { game } = newTable();
    const tactician = spawn(game, "Cenn's Tactician", A);
    const bear = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 1);
    activate(game, tactician, 0, { targets: [ref(tactician)] });
    expect(game.state.objects[tactician].counters["+1/+1"]).toBe(1);
    expect(game.state.objects[bear].counters["+1/+1"] ?? 0).toBe(0);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: tactician, abilityIndex: 0, targets: [ref(bear)] })).not.toBeNull();
  });

  it("Hundred-Handed One: reach and many blocks only while monstrous", () => {
    const { game } = newTable();
    const giant = spawn(game, "Hundred-Handed One", B);
    expect(keywords(game, giant)).not.toContain("reach");
    game.state.objects[giant].monstrous = true;
    expect(keywords(game, giant)).toContain("reach");
    expect(maxBlocks(game, giant, bears(game, 3))).toBe(3);
  });

  it("Hundred-Handed One not monstrous blocks one", () => {
    const { game } = newTable();
    const giant = spawn(game, "Hundred-Handed One", B);
    expect(maxBlocks(game, giant, bears(game, 2))).toBeUndefined();
  });

  it("Iona's Blessing: two of them let it block three", () => {
    const { game } = newTable();
    const wall = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 8);
    cast(game, toHand(game, "Iona's Blessing"), { targets: [ref(wall)] });
    cast(game, toHand(game, "Iona's Blessing"), { targets: [ref(wall)] });
    expect(pt(game, wall)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, wall)).toContain("vigilance");
    expect(maxBlocks(game, wall, bears(game, 4))).toBe(3);
  });

  it("Give No Ground: +2/+6 and any number of blocks this turn", () => {
    const { game } = newTable();
    const wall = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Give No Ground"), { targets: [ref(wall)] });
    expect(pt(game, wall)).toEqual({ power: 4, toughness: 8 });
    expect(maxBlocks(game, wall, bears(game, 4))).toBe(4);
  });

  it("Avatar of Hope costs {W}{W} at 3 life, its full cost otherwise", () => {
    const { game } = newTable();
    lands(game, "Plains", 2);
    const avatar = toHand(game, "Avatar of Hope");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: avatar, targets: [] })).not.toBeNull();
    game.state.players[A].life = 3;
    cast(game, avatar);
    expect(zone(game, avatar)).toBe("battlefield");
  });
});

describe("Quantum Reduction", () => {
  it("may be cast at instant speed only using teamwork", () => {
    const { game } = newTable({ step: "upkeep" });
    const angel = spawn(game, "Serra Angel", B);
    const bear = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 2);
    const aura = toHand(game, "Quantum Reduction");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: aura, targets: [ref(angel)] })).not.toBeNull();
    cast(game, aura, { targets: [ref(angel)], kicked: true, tap: [bear] });
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(zone(game, aura)).toBe("battlefield");
    expect(pt(game, angel)).toEqual({ power: -1, toughness: 4 });
    expect([...keywords(game, angel)]).toEqual([]);
  });
});

describe("becoming a creature type", () => {
  it("Dragonsoul Knight: a 7/5 Dragon with flying and trample, no longer a Human Knight", () => {
    const { game } = newTable();
    const knight = spawn(game, "Dragonsoul Knight", A);
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    activate(game, knight);
    expect(subtypes(game, knight)).toEqual(["Dragon"]);
    expect(pt(game, knight)).toEqual({ power: 7, toughness: 5 });
    expect([...keywords(game, knight)].sort()).toEqual(["first-strike", "flying", "trample"]);
  });

  it("Wishful Merfolk: loses defender and is a Human, not a Merfolk", () => {
    const { game } = newTable();
    const merfolk = spawn(game, "Wishful Merfolk", A);
    lands(game, "Island", 2);
    const before = hand(game).length;
    activate(game, merfolk);
    expect(hand(game).length).toBe(before);
    expect([...keywords(game, merfolk)]).toEqual([]);
    expect(subtypes(game, merfolk)).toEqual(["Human"]);
  });
});
