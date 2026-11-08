/**
 * Mana restrictions on how a spell is cast (rule 106.6): `castFrom` (Lord of the
 * Forsaken, Interdimensional Web Watch, Mm'menon, Altar of the Lost), the deny-list
 * `notCastFrom` (Heartwood Crafter), the `"kicked-spell"` purpose (Elfhame Druid,
 * Volshe Tideturner), `spell.hasAbilities` read of the spell as it's cast (Jasmine
 * Boreal of the Seven), `spendOnlyManaFrom` on the spell's card (Myr Superion,
 * Imperiosaur), and a menu of creature types as a land enters (Eclipsed Realms).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  lands,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const casts = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card);
const castable = (game: Game, card: ObjectId): boolean => casts(game, card).length > 0;
const pool = (game: Game): number => game.state.players[A].manaPool.length;
const playable = (game: Game, card: ObjectId): void => {
  game.state.objects[card].playPermission = { player: A, expiry: "end-of-turn", play: true };
};

describe("castFrom: where the spell is cast from", () => {
  it("Interdimensional Web Watch's mana pays for a spell cast from exile, not from hand", () => {
    const { game } = table();
    spawn(game, "Interdimensional Web Watch");
    expect(castable(game, toHand(game, "Grizzly Bears"))).toBe(false);
    const exiled = toExile(game, "Grizzly Bears");
    playable(game, exiled);
    expect(castable(game, exiled)).toBe(true);
  });

  it("Interdimensional Web Watch exiles the top two, playable", () => {
    const { game } = table();
    const top = toLibrary(game, "Grizzly Bears");
    enter(game, "Interdimensional Web Watch");
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[top].playPermission).toBeDefined();
  });

  it("Lord of the Forsaken's mana pays for a spell from your graveyard, not your hand", () => {
    const { game } = table();
    const lord = spawn(game, "Lord of the Forsaken");
    lands(game, "Island", 1);
    const flashback = toGraveyard(game, "Think Twice");
    const inHand = toHand(game, "Think Twice");
    activate(game, lord, 1);
    activate(game, lord, 1);
    expect(pool(game)).toBe(2);
    // {2}{U} from the graveyard; in hand {1}{U} would be two floating {C} and an
    // Island's {U} too, were they allowed.
    expect(castable(game, flashback)).toBe(true);
    expect(castable(game, inHand)).toBe(false);
    cast(game, flashback, { via: "flashback" });
    expect(pool(game)).toBe(0);
  });

  it("Altar of the Lost pays for a spell with flashback from a graveyard, and no other", () => {
    const { game } = table();
    const altar = spawn(game, "Altar of the Lost");
    game.state.objects[altar].tapped = false;
    lands(game, "Wastes", 1);
    const flashback = toGraveyard(game, "Think Twice");
    expect(castable(game, flashback)).toBe(true);
    expect(castable(game, toHand(game, "Think Twice"))).toBe(false);
    // No flashback, from exile: not its mana, whichever way it may be cast.
    const exiled = toExile(game, "Think Twice");
    playable(game, exiled);
    expect(castable(game, exiled)).toBe(false);
  });

  it("Altar of the Lost enters tapped and makes two mana", () => {
    const { game } = table();
    const altar = enter(game, "Altar of the Lost");
    expect(game.state.objects[altar].tapped).toBe(true);
    game.state.objects[altar].tapped = false;
    activate(game, altar, 0);
    expect(pool(game)).toBe(2);
    expect(game.state.players[A].manaPool[0].restriction?.castFrom?.withFlashback).toBe(true);
  });

  it("Mm'menon's artifacts pay for a card off the library, and not a card in hand", () => {
    const { game } = table();
    spawn(game, "Mm'menon, the Right Hand");
    spawn(game, "Ornithopter");
    const inHand = toHand(game, "Sol Ring");
    const top = toLibrary(game, "Sol Ring");
    expect(castable(game, top)).toBe(true);
    expect(castable(game, inHand)).toBe(false);
  });
});

describe("notCastFrom: a deny-list", () => {
  it("Heartwood Crafter's mana pays for anything but a spell from your hand", () => {
    const { game } = table();
    spawn(game, "Heartwood Crafter");
    lands(game, "Wastes", 1);
    expect(castable(game, toHand(game, "Mind Stone"))).toBe(false);
    const exiled = toExile(game, "Mind Stone");
    playable(game, exiled);
    expect(castable(game, exiled)).toBe(true);
  });

  it("Heartwood Crafter's mana pays for an ability", () => {
    const { game } = table();
    spawn(game, "Heartwood Crafter");
    const stone = spawn(game, "Mind Stone");
    const offered = game
      .legalActions(A)
      .filter((a) => a.kind === "activate-ability" && a.source === stone && a.text.includes("Draw"));
    expect(offered).toHaveLength(1);
  });

  it("Heartwood Crafter enters prepared, and its mana pays for its copy of Soul Tether", () => {
    const { game } = table();
    const crafter = enter(game, "Heartwood Crafter");
    const copy = game.state.objects[crafter].prepared?.copy;
    expect(copy).toBeDefined();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    // {2}{R/G}: a Mountain, a Wastes and the Crafter.
    expect(castable(game, copy!)).toBe(true);
    game.state.objects[crafter].tapped = true;
    expect(castable(game, copy!)).toBe(false);
  });
});

describe("kicked spells", () => {
  it("Elfhame Druid's second ability pays all of a kicked spell, and not the same spell unkicked", () => {
    const { game } = table();
    const druid = spawn(game, "Elfhame Druid");
    activate(game, druid, 1);
    expect(pool(game)).toBe(2);
    const titan = toHand(game, "Kavu Titan");
    // {1}{G}: two floating {G} are enough, but not for this.
    expect(castable(game, titan)).toBe(false);
    lands(game, "Forest", 3);
    const kicked = casts(game, titan).filter((c) => c.kicked === true);
    expect(kicked).toHaveLength(1);
    cast(game, titan, { kicked: true });
    expect(pool(game)).toBe(0);
    expect(zone(game, titan)).toBe("battlefield");
    expect(game.state.objects[titan].counters["+1/+1"]).toBe(3);
  });

  it("Elfhame Druid's first ability is plain mana", () => {
    const { game } = table();
    spawn(game, "Elfhame Druid");
    expect(castable(game, toHand(game, "Llanowar Elves"))).toBe(true);
  });

  it("Volshe Tideturner pays for an instant, not a creature spell unkicked", () => {
    const { game } = table();
    spawn(game, "Volshe Tideturner");
    expect(castable(game, toHand(game, "Opt"))).toBe(true);
    expect(castable(game, toHand(game, "Merfolk of the Pearl Trident"))).toBe(false);
  });
});

describe("creature spells with no abilities", () => {
  it("Jasmine pays for a vanilla creature, not one with an ability", () => {
    const { game } = table();
    spawn(game, "Jasmine Boreal of the Seven");
    expect(castable(game, toHand(game, "Grizzly Bears"))).toBe(true);
    expect(castable(game, toHand(game, "Savannah Lions"))).toBe(true);
    expect(castable(game, toHand(game, "Llanowar Elves"))).toBe(false);
  });

  it("a spell a static gives an ability as it's cast has one (rule 601.2a)", () => {
    const { game } = table();
    spawn(game, "Jasmine Boreal of the Seven");
    const bear = toHand(game, "Grizzly Bears");
    expect(castable(game, bear)).toBe(true);
    // "Spells you cast from your hand with mana value X or less have cascade":
    // X is 0 until an opponent loses life this turn.
    spawn(game, "Abaddon the Despoiler");
    expect(castable(game, bear)).toBe(true);
    game.debugApplyEffect(A, { kind: "lose-life", who: "each-opponent", amount: 2 }, []);
    expect(castable(game, bear)).toBe(false);
    // Reading it as a spell leaves the card where it was.
    expect(zone(game, bear)).toBe("hand");
    expect(game.state.objects[bear].castFrom).toBeUndefined();
  });
});

describe("Jasmine's other line", () => {
  it("creatures you control with no abilities can't be blocked by creatures with abilities", () => {
    const { game, a } = table();
    spawn(game, "Jasmine Boreal of the Seven");
    const bear = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    const vanilla = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game.legalActions(B).find((o) => o.kind === "declare-blockers");
    if (offer?.kind !== "declare-blockers") throw new Error("no block offer");
    expect(offer.eligible.find((e) => e.blocker === vanilla)?.canBlock).toContain(bear);
    expect(offer.eligible.find((e) => e.blocker === elves)?.canBlock ?? []).not.toContain(bear);
  });
});

describe("spendOnlyManaFrom: the spell's own limit on what makes its mana", () => {
  it("Imperiosaur is cast with basic lands, and not with a creature's mana", () => {
    const { game } = table();
    const dino = toHand(game, "Imperiosaur");
    lands(game, "Forest", 3);
    spawn(game, "Llanowar Elves");
    expect(castable(game, dino)).toBe(false);
    lands(game, "Forest", 1);
    expect(castable(game, dino)).toBe(true);
    cast(game, dino);
    expect(zone(game, dino)).toBe("battlefield");
  });

  it("a nonbasic land's mana doesn't pay for Imperiosaur, floating or not", () => {
    const { game } = table();
    const dino = toHand(game, "Imperiosaur");
    const nonbasic = lands(game, "Reliquary Tower", 1)[0];
    lands(game, "Forest", 3);
    expect(castable(game, dino)).toBe(false);
    activate(game, nonbasic, 0);
    expect(pool(game)).toBe(1);
    expect(castable(game, dino)).toBe(false);
  });

  it("mana already floating from a basic land pays for Imperiosaur", () => {
    const { game } = table();
    const dino = toHand(game, "Imperiosaur");
    const forests = lands(game, "Forest", 4);
    activate(game, forests[0], 0);
    expect(pool(game)).toBe(1);
    expect(castable(game, dino)).toBe(true);
    cast(game, dino);
    expect(pool(game)).toBe(0);
  });

  it("Myr Superion is cast with creatures' mana, not a land's", () => {
    const { game } = table();
    const myr = toHand(game, "Myr Superion");
    lands(game, "Forest", 2);
    expect(castable(game, myr)).toBe(false);
    spawn(game, "Llanowar Elves");
    expect(castable(game, myr)).toBe(false);
    spawn(game, "Llanowar Elves");
    expect(castable(game, myr)).toBe(true);
  });

  it("the extra mana an Aura adds as a basic is tapped floats, and doesn't pay", () => {
    const { game } = table();
    const dino = toHand(game, "Imperiosaur");
    const forests = lands(game, "Forest", 3);
    const growth = spawn(game, "Wild Growth");
    game.state.objects[growth].attachedTo = forests[0];
    expect(castable(game, dino)).toBe(false);
    lands(game, "Forest", 1);
    expect(castable(game, dino)).toBe(true);
    cast(game, dino, { settle: false });
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["G"]);
    settle(game);
  });
});

describe("chooseCreatureTypeMenu", () => {
  it("Eclipsed Realms offers its eight types, and its coloured mana pays only for that type", () => {
    const { game, a } = table();
    let options: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, offered) => {
      options = offered;
      return "Elf";
    };
    const land = toHand(game, "Eclipsed Realms");
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(options).toEqual(["Elemental", "Elf", "Faerie", "Giant", "Goblin", "Kithkin", "Merfolk", "Treefolk"]);
    expect(game.state.objects[land].chosenCreatureType).toBe("Elf");
    expect(castable(game, toHand(game, "Llanowar Elves"))).toBe(true);
    expect(castable(game, toHand(game, "Savannah Lions"))).toBe(false);
    // Its other ability is plain {C}.
    expect(castable(game, toHand(game, "Ornithopter"))).toBe(true);
    expect(castable(game, toHand(game, "Sol Ring"))).toBe(true);
  });
});
