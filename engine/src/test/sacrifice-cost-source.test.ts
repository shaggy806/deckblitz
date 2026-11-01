/**
 * A sacrifice cost's filters matched against the ability's source
 * (`SacrificeCost`'s `filter` and each of an `each`'s): a clause about the
 * source reads it — `isSource` ("Sacrifice this creature and another green
 * creature", "another creature or an artifact"), `hostOfSource` ("Sacrifice
 * enchanted creature"), `ofChosenType` ("a creature of the chosen type").
 * Before, they were matched with no source, so each of these matched nothing.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  lands,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

type AbilityOffer = Extract<LegalAction, { kind: "activate-ability" }>;
const offer = (game: Game, source: ObjectId, index = 0): AbilityOffer | undefined =>
  game
    .legalActions(A)
    .find((a): a is AbilityOffer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);
const choices = (game: Game, source: ObjectId, index = 0): readonly ObjectId[] =>
  [...(offer(game, source, index)?.sacrifice?.choices ?? [])].sort();
const sacrificing = (
  game: Game,
  source: ObjectId,
  index: number,
  victim: ObjectId,
  targets: readonly (ObjectId | PlayerId)[] = [],
): void => {
  game.dispatch({
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: index,
    targets: targets.map(ref),
    sacrifice: victim,
  });
  settle(game);
};

describe("'another' on one branch of a sacrifice cost's filter", () => {
  it("Mold Folk: another creature or an artifact, never itself as the creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const folk = spawn(game, "Mold Folk");
    const bear = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    expect(choices(game, folk)).toEqual([bear, ring].sort());
    expect(() => sacrificing(game, folk, 0, folk)).toThrow(/sacrific/);
    sacrificing(game, folk, 0, ring);
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, folk)).toBe(1);
  });

  it("Malevolent Noble alone has nothing to sacrifice", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const noble = spawn(game, "Malevolent Noble");
    expect(offer(game, noble)).toBeUndefined();
    const bear = spawn(game, "Grizzly Bears");
    expect(choices(game, noble)).toEqual([bear]);
    sacrificing(game, noble, 0, bear);
    expect(counters(game, noble)).toBe(1);
  });
});

describe("a sacrifice cost of a creature of the chosen type", () => {
  it("Doom Cannon reads its own choice", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const cannon = spawn(game, "Doom Cannon");
    const other = spawn(game, "Doom Cannon");
    game.state.objects[cannon].chosenCreatureType = "Goblin";
    game.state.objects[other].chosenCreatureType = "Bear";
    const goblin = spawn(game, "Raging Goblin");
    const bear = spawn(game, "Grizzly Bears");
    expect(choices(game, cannon)).toEqual([goblin]);
    expect(choices(game, other)).toEqual([bear]);
    const life = game.state.players[B].life;
    sacrificing(game, cannon, 0, goblin, [B]);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(life - 3);
  });

  it("with no type chosen, Etchings of the Chosen has nothing to sacrifice", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const etchings = spawn(game, "Etchings of the Chosen");
    const bear = spawn(game, "Grizzly Bears");
    expect(offer(game, etchings)).toBeUndefined();
    game.state.objects[etchings].chosenCreatureType = "Bear";
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    const knight = spawn(game, "Savannah Lions");
    expect(choices(game, etchings)).toEqual([bear]);
    // The indestructible goes to any creature you control (the ruling).
    sacrificing(game, etchings, 0, bear, [knight]);
    expect(zone(game, bear)).toBe("graveyard");
    expect(game.state.objects[knight].zone).toBe("battlefield");
  });
});

describe("Sacrifice enchanted creature", () => {
  const enchant = (game: Game, aura: string, creature: ObjectId): ObjectId => {
    lands(game, "Mountain", 3);
    const card = toHand(game, aura);
    cast(game, card, { targets: [ref(creature)] });
    return card;
  };

  it("Betrothed of Fire sacrifices the creature it enchants, and only that one", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const aura = enchant(game, "Betrothed of Fire", bear);
    expect(game.state.objects[aura].attachedTo).toBe(bear);
    expect(choices(game, aura, 1)).toEqual([bear]);
    sacrificing(game, aura, 1, bear);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, aura)).toBe("graveyard");
    expect(pt(game, lions)).toEqual({ power: 4, toughness: 1 });
  });

  it("Betrothed of Fire on a creature you don't control: no one can pay (the ruling)", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Savannah Lions");
    const aura = enchant(game, "Betrothed of Fire", theirs);
    expect(game.state.objects[aura].attachedTo).toBe(theirs);
    expect(offer(game, aura, 1)).toBeUndefined();
    // The first ability's untapped creature is any of yours.
    expect(offer(game, aura, 0)).toBeDefined();
  });

  it("Betrothed of Fire's first ability takes only an untapped creature", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const tapped = spawn(game, "Savannah Lions", A, { tapped: true });
    const aura = enchant(game, "Betrothed of Fire", bear);
    expect(choices(game, aura, 0)).toEqual([bear]);
    expect(choices(game, aura, 0)).not.toContain(tapped);
  });

  it("Bloodfire Infusion deals the sacrificed creature's power to each creature", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const aura = enchant(game, "Bloodfire Infusion", giant);
    lands(game, "Mountain", 1);
    sacrificing(game, aura, 0, giant);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Sacrifice this permanent and another", () => {
  it("Magus of the Order sacrifices itself and another green creature together", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const magus = spawn(game, "Magus of the Order");
    // Alone, or beside only a nongreen creature, it can't pay.
    spawn(game, "Savannah Lions");
    expect(offer(game, magus)).toBeUndefined();
    const elves = spawn(game, "Llanowar Elves");
    toLibrary(game, "Craw Wurm");
    expect(offer(game, magus)).toBeDefined();
    activate(game, magus, 0);
    expect(zone(game, magus)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(graveyard(game).length).toBe(2);
  });

  it("Great Hall of Starnheim needs a creature besides itself", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    const hall = spawn(game, "Great Hall of Starnheim");
    expect(game.state.objects[hall].tapped).toBe(true); // it enters tapped
    game.state.objects[hall].tapped = false;
    expect(offer(game, hall, 1)).toBeUndefined();
    const bear = spawn(game, "Grizzly Bears");
    activate(game, hall, 1);
    expect(zone(game, hall)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    expect(tokensNamed(game, "Angel Warrior Token (Flying, Vigilance)", A)).toBe(1);
  });

  it("Sandstone Deadfall asks which two lands, and goes with them", () => {
    const { game } = table();
    const deadfall = spawn(game, "Sandstone Deadfall");
    const attacker = spawn(game, "Grizzly Bears", B);
    game.state.objects[attacker].attacking = A;
    const [l1] = lands(game, "Wastes", 1);
    expect(offer(game, deadfall)).toBeUndefined();
    const [l2, l3] = lands(game, "Wastes", 2);
    game.dispatch({ type: "activate-ability", player: A, source: deadfall, abilityIndex: 0, targets: [ref(attacker)] });
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    const asked = game.state.awaiting?.kind === "sacrifice" ? game.state.awaiting : undefined;
    expect([...(asked?.eligible ?? [])].sort()).toEqual([l1, l2, l3].sort());
    expect(asked?.eligible).not.toContain(deadfall);
    game.dispatch({ type: "sacrifice", player: A, permanents: [l1] });
    game.dispatch({ type: "sacrifice", player: A, permanents: [l2] });
    settle(game);
    expect(zone(game, deadfall)).toBe("graveyard");
    expect(zone(game, l1)).toBe("graveyard");
    expect(zone(game, l2)).toBe("graveyard");
    expect(zone(game, l3)).toBe("battlefield");
    expect(zone(game, attacker)).toBe("graveyard");
  });
});
