/**
 * When a spell may be cast or an ability activated: flash for an extra cost
 * (rule 601.3c), abilities only opponents may activate (602.2), loyalty
 * abilities barred or spared (606), activating as though with haste (302.6),
 * loyalty abilities twice (606.3), bans with a duration, casting only as a
 * sorcery (601.3), legendary sorceries (205.4e) and a spell uncounterable under
 * a condition.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  cast,
  counters,
  enter,
  lands,
  loyalty,
  nextTurn,
  pickTargets,
  ref,
  spawn,
  table,
  tokensNamed,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const offered = (game: Game, card: ObjectId, player: PlayerId = A): boolean => offers(game, card, player).length > 0;
const canActivate = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === source);

describe("flash for an extra cost (rule 601.3c)", () => {
  it("at instant speed only for the extra cost, and it isn't kicked (Rout)", () => {
    const { game } = table();
    const rout = toHand(game, "Rout");
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    // In the main phase with the stack empty, the plain cast at five lands.
    expect(offers(game, rout).some((o) => o.kicked !== true)).toBe(true);
    expect(offers(game, rout).some((o) => o.kicked === true)).toBe(false);
    // On the stack's top after a spell: only the dearer one, and five lands aren't seven.
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"), { settle: false });
    expect(offered(game, rout)).toBe(false);
    lands(game, "Plains", 2);
    const [flash] = offers(game, rout);
    expect(flash.kicked).toBe(true);
    expect(flash.kickerKeyword).toBe("flash");
    cast(game, rout, { kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a creature too, and only for the extra cost (Harbinger of the Tides)", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const harbinger = toHand(game, "Harbinger of the Tides");
    cast(game, toHand(game, "Opt"), { settle: false });
    const offered = offers(game, harbinger);
    expect(offered.length).toBeGreaterThan(0);
    expect(offered.every((o) => o.kicked === true)).toBe(true);
    cast(game, harbinger, { kicked: true });
    expect(zone(game, harbinger)).toBe("battlefield");
  });

  it("a kicked spell only counts what's really kicked (filter `kicked`)", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const roost = spawn(game, "Roost of Drakes");
    cast(game, toHand(game, "Opt"), { settle: false });
    cast(game, toHand(game, "Harbinger of the Tides"), { kicked: true });
    expect(tokensNamed(game, "Drake Token")).toBe(0);
    expect(roost).toBeDefined();
  });
});

describe("only your opponents may activate (rule 602.2)", () => {
  it("the Aura's controller can't, an opponent may, as a sorcery, and it locks what it's on (Detention Vortex)", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const vault = spawn(game, "Sol Ring", B);
    const vortex = toHand(game, "Detention Vortex");
    pickTargets(a, vault);
    cast(game, vortex, { targets: [ref(vault)] });
    expect(zone(game, vortex)).toBe("battlefield");
    expect(canActivate(game, vortex)).toBe(false);
    expect(() => activate(game, vortex, 0)).toThrow();
    nextTurn(game);
    expect(canActivate(game, vault, B)).toBe(false);
    lands(game, "Swamp", 3, B);
    expect(canActivate(game, vortex, B)).toBe(true);
    activate(game, vortex, 0, { player: B });
    expect(zone(game, vortex)).toBe("graveyard");
    expect(canActivate(game, vault, B)).toBe(true);
  });
});

describe("abilities barred by kind (rule 606)", () => {
  it("players can't activate loyalty abilities, and anything else still works (The Immortal Sun)", () => {
    const { game } = table();
    const walker = enter(game, "Teferi, Time Raveler");
    spawn(game, "The Immortal Sun", B);
    expect(canActivate(game, walker)).toBe(false);
    expect(() => loyalty(game, walker, 1)).toThrow();
    const elixir = spawn(game, "Thousand-Year Elixir");
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    expect(canActivate(game, elixir)).toBe(true);
  });

  it("everything but mana and loyalty, from any zone (Overwhelming Splendor)", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const walker = enter(game, "Teferi, Time Raveler");
    const elixir = spawn(game, "Thousand-Year Elixir");
    const bears = spawn(game, "Grizzly Bears");
    const splendor = toHand(game, "Overwhelming Splendor");
    expect(canActivate(game, elixir)).toBe(true);
    cast(game, splendor, { targets: [ref(A)] });
    expect(zone(game, splendor)).toBe("battlefield");
    expect(canActivate(game, elixir)).toBe(false);
    expect(canActivate(game, walker)).toBe(true);
    expect(game.state.objects[bears].zone).toBe("battlefield");
  });
});

describe("as though with haste (rule 302.6)", () => {
  it("a sick creature's {T} ability works, a sick creature still can't attack (Thousand-Year Elixir)", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer", A, { sick: true });
    expect(canActivate(game, sorcerer)).toBe(false);
    spawn(game, "Thousand-Year Elixir");
    expect(canActivate(game, sorcerer)).toBe(true);
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(19);
    // Another's creature gets nothing from it.
    const theirs = spawn(game, "Prodigal Sorcerer", B, { sick: true });
    nextTurn(game);
    game.state.objects[theirs].summoningSick = true;
    expect(canActivate(game, theirs, B)).toBe(false);
  });

  it("mana abilities too: the auto-payer may tap a sick creature (Thousand-Year Elixir)", () => {
    const { game } = table();
    spawn(game, "Llanowar Elves", A, { sick: true });
    const growth = toHand(game, "Giant Growth");
    spawn(game, "Grizzly Bears");
    expect(offered(game, growth)).toBe(false);
    spawn(game, "Thousand-Year Elixir");
    expect(offered(game, growth)).toBe(true);
  });
});

describe("loyalty abilities twice (rule 606.3)", () => {
  it("once without it, twice with it, and a third time never (Oath of Teferi)", () => {
    const { game } = table();
    const teferi = enter(game, "Teferi, Time Raveler");
    const before = counters(game, teferi, "loyalty");
    loyalty(game, teferi, 1);
    expect(canActivate(game, teferi)).toBe(false);
    spawn(game, "Oath of Teferi");
    expect(canActivate(game, teferi)).toBe(true);
    loyalty(game, teferi, 1);
    expect(counters(game, teferi, "loyalty")).toBe(before + 2);
    expect(canActivate(game, teferi)).toBe(false);
  });
});

describe("bans with a duration", () => {
  it("the bounced creature's name, its owner's, until your next turn (Reflector Mage)", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const mage = toHand(game, "Reflector Mage");
    pickTargets(a, bears);
    cast(game, mage);
    expect(zone(game, bears)).toBe("hand");
    nextTurn(game);
    lands(game, "Forest", 4, B);
    expect(offered(game, bears, B)).toBe(false);
    // Another name is fine.
    const elves = toHand(game, "Llanowar Elves", B);
    expect(offered(game, elves, B)).toBe(true);
    nextTurn(game);
    // The ban is its owner's alone: the Mage's controller may cast that name.
    const mine = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    expect(offered(game, mine)).toBe(true);
    nextTurn(game);
    expect(offered(game, bears, B)).toBe(true);
  });

  it("a token bounced: its name is still banned (Reflector Mage)", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const token = spawn(game, "Grizzly Bears", B);
    game.state.objects[token].isToken = true;
    const mage = toHand(game, "Reflector Mage");
    pickTargets(a, token);
    cast(game, mage);
    nextTurn(game);
    lands(game, "Forest", 2, B);
    const realBears = toHand(game, "Grizzly Bears", B);
    expect(offered(game, realBears, B)).toBe(false);
  });

  it("through the end of your next turn (Single Combat)", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const keep = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Goblin Piker");
    spawn(game, "Goblin Piker", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Single Combat"));
    expect([keep, other].filter((id) => zone(game, id) === "battlefield").length).toBe(1);
    expect(zone(game, theirs) === "battlefield" || zone(game, theirs) === "graveyard").toBe(true);
    const creature = toHand(game, "Llanowar Elves");
    const sorcery = toHand(game, "Divination");
    lands(game, "Forest", 5);
    lands(game, "Island", 1);
    expect(offered(game, creature)).toBe(false);
    expect(offered(game, sorcery)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    // The caster's next turn: still barred until its end.
    expect(offered(game, creature)).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(offered(game, creature)).toBe(true);
  });
});

describe("casting only as a sorcery (rule 601.3)", () => {
  it("binds opponents on every turn, flash or not, and frees them at a sorcery's timing (Teferi, Time Raveler)", () => {
    const { game } = table();
    enter(game, "Teferi, Time Raveler");
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(offered(game, bolt, B)).toBe(false);
    nextTurn(game);
    // Their own main phase, the stack empty: it's a sorcery's timing.
    expect(offered(game, bolt, B)).toBe(true);
    // Their spell on the stack: their second has to wait.
    lands(game, "Mountain", 1, B);
    const second = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    expect(offered(game, second, B)).toBe(false);
  });

  it("doesn't touch its controller, and its +1 gives sorceries flash until your next turn", () => {
    const { game } = table();
    const teferi = enter(game, "Teferi, Time Raveler");
    lands(game, "Island", 5);
    const sorcery = toHand(game, "Divination");
    cast(game, toHand(game, "Opt"), { settle: false });
    expect(offered(game, sorcery)).toBe(false);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder === A);
    loyalty(game, teferi, 1);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder === A);
    cast(game, toHand(game, "Opt"), { settle: false });
    expect(offered(game, sorcery)).toBe(true);
  });
});

describe("a legendary sorcery (rule 205.4e)", () => {
  it("needs a legendary creature or planeswalker of the caster's (Urza's Ruinous Blast)", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const blast = toHand(game, "Urza's Ruinous Blast");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(offered(game, blast)).toBe(false);
    spawn(game, "Killian, Ink Duelist", B);
    expect(offered(game, blast)).toBe(false);
    const killian = spawn(game, "Killian, Ink Duelist");
    expect(offered(game, blast)).toBe(true);
    cast(game, blast);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, killian)).toBe("battlefield");
  });
});

describe("uncounterable under a condition", () => {
  it("is countered without spell mastery and not with it (Exquisite Firecraft)", () => {
    const first = table();
    lands(first.game, "Mountain", 3);
    lands(first.game, "Island", 2);
    const countered = toHand(first.game, "Exquisite Firecraft");
    cast(first.game, countered, { targets: [ref(B)], settle: false });
    const counterspell = toHand(first.game, "Counterspell");
    cast(first.game, counterspell, { targets: [ref(countered)] });
    expect(zone(first.game, countered)).toBe("graveyard");
    expect(first.game.state.players[B].life).toBe(20);

    const second = table();
    lands(second.game, "Mountain", 3);
    lands(second.game, "Island", 2);
    toGraveyard(second.game, "Opt");
    toGraveyard(second.game, "Divination");
    const firecraft = toHand(second.game, "Exquisite Firecraft");
    cast(second.game, firecraft, { targets: [ref(B)], settle: false });
    const again = toHand(second.game, "Counterspell");
    cast(second.game, again, { targets: [ref(firecraft)] });
    expect(second.game.state.players[B].life).toBe(16);
  });
});

describe("a ban on your own creature spells", () => {
  it("binds only its controller (Steel Golem)", () => {
    const { game } = table();
    spawn(game, "Steel Golem");
    lands(game, "Forest", 2);
    const elves = toHand(game, "Llanowar Elves");
    const growth = toHand(game, "Giant Growth");
    spawn(game, "Grizzly Bears");
    expect(offered(game, elves)).toBe(false);
    expect(offered(game, growth)).toBe(true);
    nextTurn(game);
    lands(game, "Forest", 1, B);
    const theirs = toHand(game, "Llanowar Elves", B);
    expect(offered(game, theirs, B)).toBe(true);
  });
});
