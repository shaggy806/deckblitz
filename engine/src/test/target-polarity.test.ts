/**
 * Which side of the table a target belongs on (`target-polarity.ts`) — read
 * off real cards, since what matters is that the effect vocabulary says the
 * right thing about the cards people actually play.
 */

import { describe, expect, it } from "vitest";

import { POOL_CARDS, createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { haunt } from "../cards/helpers.js";
import {
  abilityPolarities,
  castPolarities,
  onlyWrongSide,
  pendingTargetPolarities,
  rankTargets,
  slotStrengths,
  specSide,
} from "../target-polarity.js";
import type { TargetSpec } from "../target.js";

const registry = createDefaultRegistry();
const cast = (name: string) => castPolarities(registry.get(name));
const activated = (name: string, index: number) =>
  abilityPolarities(registry.get(name).activated[index]);
const triggered = (name: string, index: number) =>
  abilityPolarities(registry.get(name).triggered[index]);

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const C = asPlayerId("carol");
const D = asPlayerId("dave");

describe("slot polarity", () => {
  it("aims removal, theft and punishment at an opponent", () => {
    for (const name of [
      "Murder",
      "Doom Blade",
      "Lightning Bolt",
      "Negate",
      "Counterspell",
      "Act of Treason",
      "Diabolic Edict",
      "Blightning",
      "Turn to Frog",
      "Unlicensed Disintegration",
    ]) {
      expect(cast(name), name).toEqual(["harm"]);
    }
  });

  it("reads a -X/-X written as a negative product as removal, not a pump", () => {
    // `{ product: ["x", -1] }`: the sign is the factor's, not a live count's.
    expect(cast("Defile")).toEqual(["harm"]);
    expect(activated("Necropolis Fiend", 0)).toEqual(["harm"]);
    expect(activated("Grim Hireling", 0)).toEqual(["harm"]);
  });

  it("lets removal decide over the consolation it gives its victim", () => {
    // Life for the exiled creature's controller, a land to search for, a
    // 3/3 to make up for the destroyed permanent: all still removal.
    for (const name of [
      "Swords to Plowshares",
      "Path to Exile",
      "Generous Gift",
      "Beast Within",
      "Condemn",
      "Arcane Denial",
    ]) {
      expect(cast(name), name).toEqual(["harm"]);
    }
  });

  it("aims pumps, card draw and recursion at its own side", () => {
    for (const name of ["Giant Growth", "Deep Analysis", "Regrowth", "Cloudshift"]) {
      expect(cast(name), name).toEqual(["help"]);
    }
    // Two cards outrank two life: Sign in Blood is card draw, not a burn spell.
    expect(cast("Sign in Blood")).toEqual(["help"]);
  });

  it("reads an Aura's statics for the permanent it enchants", () => {
    expect(cast("Pacifism")).toEqual(["harm"]);
    expect(cast("Mind Control")).toEqual(["harm"]);
    expect(cast("Rancor")).toEqual(["help"]);
    expect(cast("Lure")).toEqual(["help"]);
    // Goading is the point; the pump only sends it at someone else.
    expect(cast("Psychic Impetus")).toEqual(["harm"]);
    expect(cast("Acquired Mutation")).toEqual(["harm"]);
  });

  it("reads an Aura's enchanted-creature triggers when its statics say nothing", () => {
    expect(cast("Bestial Fury")).toEqual(["help"]);
    expect(cast("Gift of the Woods")).toEqual(["help"]);
    expect(cast("False Demise")).toEqual(["help"]);
    // Its controller loses life when it dies: an Aura for someone else's.
    expect(cast("Death Watch")).toEqual(["harm"]);
    expect(cast("Yoke of the Damned")).toEqual(["harm"]);
    expect(cast("Corrupted Roots")).toEqual(["harm"]);
  });

  it("reads activated and triggered abilities", () => {
    expect(activated("Garruk Wildspeaker", 0)).toEqual(["help", "help"]);
    expect(activated("Ajani, Caller of the Pride", 0)).toEqual(["help"]);
    expect(triggered("Drakuseth, Maw of Flames", 0)).toEqual(["harm", "harm", "harm"]);
    expect(triggered("Kaervek the Merciless", 0)).toEqual(["harm"]);
    expect(triggered("Rishkar, Peema Renegade", 0)).toEqual(["help", "help"]);
    expect(triggered("Snapcaster Mage", 0)).toEqual(["help"]);
  });

  it("reads an Aura by what its own abilities do to the enchanted creature", () => {
    expect(cast("Crown of Flames")).toEqual(["help"]);
    expect(cast("Sadistic Glee")).toEqual(["help"]);
  });

  it("splits a fight between the fighter and its victim", () => {
    expect(cast("Prey Upon")).toEqual(["help", "harm"]);
    expect(cast("Rabid Bite")).toEqual(["help", "harm"]);
  });

  it("takes the best of anyone's when what comes of it is yours", () => {
    expect(cast("Reanimate")).toEqual(["take"]);
    expect(cast("Twincast")).toEqual(["take"]);
    expect(cast("Hate Mirage")).toEqual(["take", "take"]);
  });

  it("reads an Aura's triggers on what it enchants, and an Aura only for your own", () => {
    expect(cast("Forced Adaptation")).toEqual(["help"]);
    expect(cast("Verdant Haven")).toEqual(["help"]);
    expect(cast("Murder Investigation")).toEqual(["help"]);
    expect(cast("Dying Wish")).toEqual(["help"]);
    // A sacrifice of what it enchants inside a sequence.
    expect(cast("Parasitic Implant")).toEqual(["harm"]);
    // A +1/+1 counter each time it attacks.
    expect(cast("Ordeal of Heliod")).toEqual(["help"]);
  });

  it("reads a random card taken from a player's graveyard onto your battlefield as harm to them", () => {
    expect(activated("Tariel, Reckoner of Souls", 0)).toEqual(["harm"]);
  });

  it("reads an Aura that taps, untaps, steals or may destroy what it enchants", () => {
    expect(cast("Narcolepsy")).toEqual(["harm"]);
    expect(cast("Pemmin's Aura")).toEqual(["help"]);
    expect(cast("Second Wind")).toEqual(["either"]);
    expect(cast("Frenzied Fugue")).toEqual(["harm"]);
    expect(cast("Wellspring")).toEqual(["harm"]);
    expect(cast("Quiet Disrepair")).toEqual(["harm"]);
  });

  it("reads an Aura that hurts its permanent's controller each upkeep, and one that arms its creature", () => {
    expect(cast("Parasitic Bond")).toEqual(["harm"]);
    expect(cast("Power Taint")).toEqual(["harm"]);
    expect(cast("Venomous Fangs")).toEqual(["help"]);
  });

  it("reads the creature a prevented damage is redirected to as taking the hit", () => {
    expect(abilityPolarities(registry.get("Outrider en-Kor").activated[0])).toEqual(["harm"]);
  });

  it("reads a delayed 'when it dies, return it' as a save", () => {
    expect(cast("Graceful Reprieve")).toEqual(["help"]);
  });

  it("reads a Magemark's 'creatures you control that are enchanted' as help", () => {
    expect(cast("Fencer's Magemark")).toEqual(["help"]);
  });

  it("reads a same-name sweep's target as the one it hits, and an Aura's own escape as no gift", () => {
    expect(cast("Maelstrom Pulse")).toEqual(["harm"]);
    expect(cast("Echoing Decay")).toEqual(["harm"]);
    expect(cast("Echoing Courage")).toEqual(["help"]);
    expect(cast("Psychic Overload")).toEqual(["harm"]);
  });

  it("reads haunt's target as the opponent's creature, the one likelier to die", () => {
    expect(abilityPolarities(haunt())).toEqual(["harm"]);
  });

  it("reads a creature dealing damage to its own controller as harm", () => {
    expect(cast("Traitor's Roar")).toEqual(["harm"]);
  });

  it("reads an Aura that hands its creature to whoever targets it as harm", () => {
    expect(cast("Fractured Loyalty")).toEqual(["harm"]);
  });

  it("reads radiance's keyword grant as help", () => {
    expect(cast("Surge of Zeal")).toEqual(["help"]);
  });

  it("reads an Aura that regenerates or rewards its creature's hits as help", () => {
    expect(cast("Strands of Undeath")).toEqual(["help"]);
    expect(cast("Necromantic Thirst")).toEqual(["help"]);
  });

  // The ratchet's real misses, sorted and read on 2026-11-17 (99 unrated,
  // 72 after): each is what the effect does to its target.
  it("reads a loot as a small gift to the player who loots, under whatever else is done to them", () => {
    expect(activated("Cephalid Looter", 0)).toEqual(["help"]);
    expect(activated("Dack Fayden", 0)).toEqual(["help"]);
    expect(activated("Lumengrid Augur", 0)).toEqual(["help"]);
    // Memory Worm's "2 damage … that player discards a card, then draws a card".
    expect(slotStrengths(registry.get("Cephalid Looter").activated[0].effect, 1)[0]?.weight).toBe(0);
  });

  it("reads the creature a sweep spares as helped, and the one it is written around as hit", () => {
    expect(cast("Avatar's Wrath")).toEqual(["help"]);
    expect(cast("Terrifying Presence")).toEqual(["help"]);
    expect(cast("Mists of Lórien")).toEqual(["harm"]);
    // A threshold above the target leaves it out: only read.
    expect(slotStrengths(registry.get("Fell the Mighty").effect, 1)).toEqual([null]);
    // Whose Auras come off it is the board's call.
    expect(slotStrengths(registry.get("Strip Bare").effect, 1)[0]?.polarity).toBe("either");
  });

  it("reads where chosen-source damage is sent, and what a prevention then does", () => {
    expect(cast("Kor Chant")).toEqual(["help", "harm"]);
    expect(cast("Refraction Trap")).toEqual(["harm"]);
    expect(cast("Sivvi's Valor")).toEqual(["help"]);
    expect(activated("General's Regalia", 0)).toEqual(["harm"]);
  });

  it("reads past a card shown beside the targets, and a choice among a target player's permanents", () => {
    expect(activated("Cursed Scroll", 0)).toEqual(["harm"]);
    expect(cast("Friendly Fire")).toEqual(["harm"]);
    expect(cast("Split the Party")).toEqual(["harm"]);
  });

  it("reads a Curse fetched onto a player, lost draws, tripled damage and a save under a condition", () => {
    expect(triggered("Bitterheart Witch", 0)).toEqual(["harm"]);
    expect(cast("Plagiarize")).toEqual(["harm"]);
    expect(activated("Jeska, Thrice Reborn", 0)).toEqual(["help"]);
    expect(activated("Saffi Eriksdotter", 0)).toEqual(["help"]);
    expect(cast("Incite Hysteria")).toEqual(["harm"]);
  });

  it("leaves a player's lands made creatures to the board, and keeps the lean of what rides with a change of types", () => {
    expect(slotStrengths(registry.get("Jolrael, Empress of Beasts").activated[0].effect, 1)[0]?.polarity).toBe("either");
    // "Creatures target player controls get -2/-0 and lose all creature types".
    expect(cast("Ego Erasure")).toEqual(["harm"]);
    expect(cast("Shields of Velis Vel")).toEqual(["help"]);
    // An untap beside a removal from combat still says whose (Reconnaissance).
    expect(activated("Reconnaissance", 0)).toEqual(["help"]);
  });

  it("rates nearly every targeted slot in the pool", () => {
    // A ratchet on slots no effect says anything about. "either" is a rating:
    // the table has looked and it's the board's call (a transform, a land's
    // type, an exchange of life totals), so it never counts against this. Until
    // 2026-11-02 it did, and every honest either-way lowered the bar. A slot
    // left here can be right too: "draw a card for each creature target player
    // controls" only reads its target (Biomantic Mastery). A rise means new
    // cards are reaching for effects the table hasn't been told about.
    const unrated: string[] = [];
    let slots = 0;
    const read = (
      name: string,
      effect: Parameters<typeof slotStrengths>[0],
      specs: readonly TargetSpec[],
      firstIsRated = false,
    ): void => {
      slotStrengths(effect, specs.length).forEach((strength, slot) => {
        slots += 1;
        const spec = specs[slot];
        // `gatedOpponents`, or only opponents to name: the spec picked the side.
        const gated =
          spec === "opponent" ||
          (typeof spec === "object" && (spec.kind === "opponent-compared" || (spec.kind === "any-number" && spec.of === "opponent")));
        if (strength === null && !gated && !(firstIsRated && slot === 0)) unrated.push(name);
      });
    };
    for (const def of POOL_CARDS) {
      if (def.targets.length > 0 && def.castModal === null) {
        // An Aura's slot leans as its Aura does (`auraPolarity`).
        read(def.name, def.effect, def.targets, (def.subtypes ?? []).includes("Aura"));
      }
      for (const ability of def.activated) read(def.name, ability.effect, ability.targets, ability.licid === true);
      for (const ability of def.triggered) read(def.name, ability.effect, ability.targets);
    }
    expect(slots).toBeGreaterThan(1500);
    // 0.50% on 2026-11-17: 72 of 14,304, with the slots whose spec picked the side left out
    // (0.65% on 2026-11-09, 89 of 13,678; 99 before the real misses among them were read).
    // What's left: about 20 that only read their target (Biomantic Mastery, Soul's Majesty,
    // Fell the Mighty's threshold), about 30 Roles and other Auras put on a "you control" or
    // "an opponent controls" slot, and a few a card's definition would have to say — an Aura
    // token or a fetched Aura on any creature (Embereth Veteran, The Rani, Arachnus Spinner,
    // Gryff's Boon), which this table reads no registry for.
    // 0.54% on 2026-11-23, 78 of 14,545: the playtest cards (B341) added three of
    // the kinds above — Roles on a creature you control (Garruk's Lost Wolf,
    // Ratatwotwo) and Indicate, which targets a permanent and does nothing.
    expect(unrated.length / slots, unrated.slice(0, 40).join("; ")).toBeLessThan(0.0054);
  });

  it("rates every member of a for-each-target, not just the slot it binds", () => {
    const [first, second] = slotStrengths(registry.get("Scheming Symmetry").effect, 2);
    expect(first?.polarity).toBe("help");
    expect(second?.polarity).toBe("help");
  });

  it("rates a slot read past a chosen permanent, and a hand put back on a library", () => {
    const strength = (effect: Parameters<typeof slotStrengths>[0]) => slotStrengths(effect, 1)[0];
    expect(strength(registry.get("Crush Underfoot").effect)?.polarity).toBe("harm");
    expect(strength(registry.get("Stunted Growth").effect)?.polarity).toBe("harm");
  });

  it("tells a slot rated either way from one nothing rates", () => {
    const strength = (effect: Parameters<typeof slotStrengths>[0]) => slotStrengths(effect, 1)[0];
    // "Target player shuffles": looked at, and it's the board's call.
    expect(strength(registry.get("Lantern of Insight").activated[0].effect)?.polarity).toBe("either");
    expect(strength(registry.get("Disarm").effect)?.polarity).toBe("either");
    // "You gain 2 life for each creature target player controls" only reads it.
    expect(strength(registry.get("Divine Congregation").effect)).toBeNull();
  });

  it("reads what's done to each permanent as done to the target player who controls them", () => {
    expect(cast("Polymorphist's Jest")).toEqual(["harm"]);
  });
});

describe("spec side", () => {
  it("says when the card has already chosen the side", () => {
    expect(specSide("creature")).toBe("any");
    expect(specSide("any-target")).toBe("any");
    expect(specSide("creature-you-control")).toBe("you");
    expect(specSide("opponent")).toBe("opponent");
    expect(specSide({ kind: "optional", of: "creature-an-opponent-controls" })).toBe("opponent");
    expect(specSide({ kind: "permanent", whose: "you", filter: { type: "creature" } })).toBe("you");
    expect(specSide({ kind: "card-in-graveyard" })).toBe("any");
  });
});

describe("ranking targets", () => {
  // Four players, and — as `legalTargets` lists them — the oldest permanents
  // first: our own Grizzly Bears before carol's Craw Wurm.
  const board = () => {
    const game = Game.create({
      seed: 3,
      registry,
      decks: [A, B, C, D].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
    });
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    const bears = game.debugSpawn("Grizzly Bears", A, "battlefield", { summoningSick: false });
    const elves = game.debugSpawn("Llanowar Elves", B, "battlefield", { summoningSick: false });
    const wurm = game.debugSpawn("Craw Wurm", C, "battlefield", { summoningSick: false });
    const baloth = game.debugSpawn("Rumbling Baloth", A, "battlefield", { summoningSick: false });
    const obj = (id: ObjectId): TargetRef => ({ kind: "object", object: id });
    return { game, bears: obj(bears), elves: obj(elves), wurm: obj(wurm), baloth: obj(baloth) };
  };

  it("puts the opponents' biggest threat first for harm, and our least valuable last-but-least-bad", () => {
    const { game, bears, elves, wurm, baloth } = board();
    const ranked = rankTargets(game.state, registry, A, [bears, elves, wurm, baloth], "harm");
    expect(ranked).toEqual([wurm, elves, bears, baloth]);
  });

  it("puts an opponent first when the damage is lethal to them, unless they can't lose", () => {
    const { game, bears, elves, wurm, baloth } = board();
    const carol: TargetRef = { kind: "player", player: C };
    const bob: TargetRef = { kind: "player", player: B };
    const options = [bears, elves, wurm, baloth, bob, carol];
    game.state.players[C].life = 4;
    // 7 kills the Craw Wurm too, but carol's whole board goes with her.
    expect(rankTargets(game.state, registry, A, options, "harm", undefined, 7)[0]).toEqual(carol);
    // On 8 she survives it, and the Wurm it kills comes first.
    game.state.players[C].life = 8;
    expect(rankTargets(game.state, registry, A, options, "harm", undefined, 7)[0]).toEqual(wurm);
    // Under Platinum Angel she can't lose the game (rule 104.3).
    game.state.players[C].life = 4;
    game.debugSpawn("Platinum Angel", C, "battlefield", { summoningSick: false });
    expect(rankTargets(game.state, registry, A, options, "harm", undefined, 7)[0]).toEqual(wurm);
  });

  it("puts our own best first for help", () => {
    const { game, bears, elves, wurm, baloth } = board();
    const ranked = rankTargets(game.state, registry, A, [bears, elves, wurm, baloth], "help");
    expect(ranked).toEqual([baloth, bears, elves, wurm]);
  });

  it("takes the best of anyone's, and leaves 'either' in the order offered", () => {
    const { game, bears, elves, wurm, baloth } = board();
    expect(rankTargets(game.state, registry, A, [bears, elves, wurm, baloth], "take")[0]).toEqual(wurm);
    expect(rankTargets(game.state, registry, A, [bears, elves, wurm, baloth], "either")).toEqual([
      bears,
      elves,
      wurm,
      baloth,
    ]);
  });

  it("knows when every legal target is on the wrong side — unless the card chose the side", () => {
    const { game, bears, baloth, wurm } = board();
    expect(onlyWrongSide(game.state, A, [bears, baloth], "harm", "creature")).toBe(true);
    expect(onlyWrongSide(game.state, A, [bears, baloth, wurm], "harm", "creature")).toBe(false);
    // "Destroy target creature you control" means it.
    expect(onlyWrongSide(game.state, A, [bears, baloth], "harm", "creature-you-control")).toBe(false);
    expect(onlyWrongSide(game.state, A, [wurm], "help", "creature")).toBe(true);
  });
});

describe("a pending trigger's slots", () => {
  it("reads the polarity of the triggered ability being put on the stack", () => {
    const game = Game.create({
      seed: 3,
      registry,
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
    });
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    for (let i = 0; i < 3; i += 1) game.debugSpawn("Forest", A, "battlefield");
    game.debugSpawn("Sol Ring", A, "battlefield");
    game.debugSpawn("Arcane Signet", B, "battlefield");
    const sage = game.debugSpawn("Reclamation Sage", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: sage, targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets");
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    expect(pendingTargetPolarities(game.state, registry)).toEqual(["harm"]);
  });
});
