/**
 * Theme 7 of docs/plans/need-key-themes.md: one `ObjectRef` / `PlayerRef`
 * algebra and the relational filter clauses that take them. A ref is read
 * (608.2h, 113.7a: as it last existed once it's gone) or acted on (400.7: the
 * same object still).
 */
import { describe, expect, it } from "vitest";

import { POOL_CARDS, TOKEN_CARDS } from "../cards.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("player refs", () => {
  it("{ otherThan }: its owner draws, each other player loses that much (Oft-Nabbed Goat)", () => {
    const { game, b } = table({ players: 3 });
    const goat = spawn(game, "Oft-Nabbed Goat");
    lands(game, "Wastes", 1, B);
    toStep(game, "precombat-main", B);
    const handBefore = game.state.zones.perPlayer[A].hand.length;
    activate(game, goat, 0, { player: B });
    expect(game.state.objects[goat].controller).toBe(B);
    expect(counters(game, goat, "-1/-1")).toBe(1);
    expect(b).toBeDefined();
    game.debugMove(goat, "graveyard");
    settle(game);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(handBefore + 1);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
  });

  it("{ defendingPlayerOf }: the attacker's defending player, as it was once removed from combat (508.5)", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    toStep(game, "precombat-main", A);
    a.declareAttackersFn = () => [{ attacker: bears, defender: C }];
    toStep(game, "declare-blockers", A);
    game.state.objects[bears].attacking = null;
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: { defendingPlayerOf: "source" } }, [], { source: bears });
    expect(life(game, C)).toBe(17);
    expect(life(game, B)).toBe(20);
  });
});

describe("object refs and hosts", () => {
  it("Unforge: { hostOf } reads the Equipment as it last existed, and acts on the host still there", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const blade = spawn(game, "Short Sword", B);
    game.state.objects[blade].attachedTo = bears;
    lands(game, "Mountain", 3);
    const unforge = toHand(game, "Unforge");
    expect(a).toBeDefined();
    cast(game, unforge, { targets: [ref(blade)] });
    expect(zone(game, blade)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard"); // a 2/2, dealt 2
  });

  it("Unforge: an Equipment on nothing deals nothing", () => {
    const { game, a } = table();
    const blade = spawn(game, "Short Sword", B);
    lands(game, "Mountain", 3);
    const unforge = toHand(game, "Unforge");
    expect(a).toBeDefined();
    cast(game, unforge, { targets: [ref(blade)] });
    expect(zone(game, blade)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("Joint Assault: { pairedWith } pumps the other half, and nothing without a partner", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    game.state.objects[bears].pairedWith = elf;
    game.state.objects[elf].pairedWith = bears;
    lands(game, "Forest", 3);
    expect(a).toBeDefined();
    cast(game, toHand(game, "Joint Assault"), { targets: [ref(bears)] });
    expect(game.state.objects[elf].modifiers.length).toBeGreaterThan(0);
    expect(game.state.objects[bears].modifiers.length).toBeGreaterThan(0);
  });

  it("Mark of Eviction: { attachedToObject: \"attached\" } returns the Auras with the creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const mark = spawn(game, "Mark of Eviction");
    const other = spawn(game, "Pacifism", B);
    game.state.objects[mark].attachedTo = bears;
    game.state.objects[other].attachedTo = bears;
    expect(a).toBeDefined();
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, mark)).toBe("hand");
    expect(zone(game, other)).toBe("hand");
  });
});

describe("relational clauses", () => {
  it("Spreading Plague: sharesColorWith the trigger object, sparing it", () => {
    const { game } = table();
    spawn(game, "Spreading Plague");
    const bears = spawn(game, "Grizzly Bears", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const knight = spawn(game, "White Knight", B);
    const entering = enter(game, "Elvish Mystic");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, knight)).toBe("battlefield");
    expect(zone(game, entering)).toBe("battlefield");
  });

  it("Nature's Will: { controlledByRef: \"trigger-player\" } taps only that player's lands", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Nature's Will");
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    const [bobs] = lands(game, "Forest", 1, B);
    const [carols] = lands(game, "Forest", 1, C);
    attack(game, a, [bears], B);
    expect(game.state.objects[bobs].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(false);
  });

  it("Backslide: hasKeyword morph keeps a morphless creature from being a target", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const morph = spawn(game, "Birchlore Rangers", B);
    lands(game, "Island", 2);
    expect(a).toBeDefined();
    const slide = toHand(game, "Backslide");
    expect(() => cast(game, slide, { targets: [ref(bears)] })).toThrow();
    cast(game, slide, { targets: [ref(morph)] });
    expect(game.state.objects[morph].faceDown).toBeDefined();
  });

  it("Witch-king: least power among what the defending player controls", () => {
    const { game, a } = table();
    const witch = spawn(game, "Witch-king, Bringer of Ruin", A, { sick: false });
    const small = spawn(game, "Llanowar Elves", B);
    const big = spawn(game, "Hill Giant", B);
    pickPermanents(a, small);
    attack(game, a, [witch], B);
    expect(zone(game, small)).toBe("graveyard");
    expect(zone(game, big)).toBe("battlefield");
  });

  it("Nether Shadow: graveyard order matters — only creature cards above it count", () => {
    const { game } = table();
    const below = toGraveyard(game, "Grizzly Bears");
    expect(below).toBeDefined();
    const shadow = toGraveyard(game, "Nether Shadow");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, shadow)).toBe("graveyard");
  });

  it("Nether Shadow: three creature cards above it put it onto the battlefield", () => {
    const { game, a } = table();
    const shadow = toGraveyard(game, "Nether Shadow");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, shadow)).toBe("battlefield");
  });
});

describe("the rest of the proving cards", () => {
  it("Storm, Windrider: { targetsOf: \"trigger-object\" } gives the spell's creature targets flying", () => {
    const { game } = table();
    spawn(game, "Storm, Windrider");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, other).has("flying")).toBe(false);
  });

  it("Archnemesis: attacking enchanted player, and { player } attaches it to whoever attacks you", () => {
    const { game, a, b } = table({ players: 3 });
    const arch = spawn(game, "Archnemesis");
    game.state.objects[arch].attachedToPlayer = B;
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    const elf = spawn(game, "Llanowar Elves", C, { sick: false });
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(22);
    pickModes(a, 0);
    expect(b).toBeDefined();
    const { c } = table({ players: 3 });
    expect(c).toBeDefined();
    expect(elf).toBeDefined();
    expect(game.state.objects[arch].attachedToPlayer).toBe(B);
    game.debugApplyEffect(A, { kind: "attach", target: { player: { target: 0 } } }, [{ kind: "player", player: C }], { source: arch });
    expect(game.state.objects[arch].attachedToPlayer).toBe(C);
  });

  it("Keeper of the Dead: only an opponent with at least two fewer creature cards in their graveyard", () => {
    const { game } = table();
    const keeper = spawn(game, "Keeper of the Dead", A, { sick: false });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    expect(() => activate(game, keeper, 0, { targets: [ref(B), ref(bears)] })).toThrow();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    activate(game, keeper, 0, { targets: [ref(B), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Corrosive Ooze: { attachedToObject: \"trigger-object\" } reads at end of combat", () => {
    const { game, a, b } = table();
    const ooze = spawn(game, "Corrosive Ooze", A, { sick: false });
    const bears = spawn(game, "Grizzly Bears", B);
    const sword = spawn(game, "Short Sword", B);
    game.state.objects[sword].attachedTo = bears;
    expect(ooze).toBeDefined();
    a.declareAttackersFn = () => [{ attacker: ooze, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: ooze }];
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, sword)).toBe("graveyard");
  });

  it("Anje Falkenrath: hasKeyword madness on the discarded card", () => {
    const { game, a } = table();
    const anje = spawn(game, "Anje Falkenrath", A, { sick: false });
    const card = toHand(game, "Fiery Temper");
    a.chooseDiscardsFn = () => [card];
    activate(game, anje);
    expect(game.state.objects[anje].tapped).toBe(false);
  });

  it("Bloodbond March: { sameNameWith: \"trigger-object\" } matches the spell's namesakes across graveyards", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Bloodbond March");
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const other = toGraveyard(game, "Llanowar Elves", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, other)).toBe("graveyard");
  });

  it("Walker of Secret Ways: look-at-hand takes a PlayerRef, the player it dealt damage to", () => {
    const { game, a } = table();
    const walker = spawn(game, "Walker of Secret Ways", A, { sick: false });
    toHand(game, "Grizzly Bears", B);
    const seen: (readonly unknown[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      seen.push(eligible);
      return [];
    };
    attack(game, a, [walker], B);
    expect(life(game, B)).toBe(19);
    expect(game.state.awaiting).toBeNull();
    expect(seen).toEqual([[]]);
  });

  it("Tsabo's Web: a land with a non-mana activated ability doesn't untap; a basic does", () => {
    const { game } = table();
    spawn(game, "Tsabo's Web");
    const strip = spawn(game, "Strip Mine", B);
    const forest = spawn(game, "Forest", B);
    game.state.objects[strip].tapped = true;
    game.state.objects[forest].tapped = true;
    toStep(game, "precombat-main", B);
    expect(game.state.objects[forest].tapped).toBe(false);
    expect(game.state.objects[strip].tapped).toBe(true);
  });

  it("Parallax Inhibitor: hasKeyword fading reads the printed keyword line", () => {
    const { game } = table();
    const inhibitor = spawn(game, "Parallax Inhibitor", A, { sick: false });
    const fading = spawn(game, "Cloudskate");
    const plain = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const before = counters(game, fading, "fade");
    activate(game, inhibitor);
    expect(counters(game, fading, "fade")).toBe(before + 1);
    expect(counters(game, plain, "fade")).toBe(0);
  });
});

describe("the pool", () => {
  // tsc doesn't excess-check `as const` card objects, and these words were
  // strings or optional keys: only a walk finds one left behind.
  const REMOVED_KEYS = [
    "controllerOfTarget",
    "ownerOfTarget",
    "sameNameAsTarget",
    "sameNameAsTriggerObject",
    "sharesColorWithTarget",
    "sharesColorWithHost",
    "sharesCreatureTypeWithHost",
    "attachedToTarget",
    "hasConvoke",
    "hasCycling",
    "hasDisguise",
    "hasFlashback",
    "hasKicker",
    "hasMutate",
    "hasSuspend",
  ];
  const REMOVED_WORDS = ["source-owner", "source-controller", "attached-controller", "trigger-owner", "attached-owner", "attached-to-source"];

  it("no definition still uses a removed reference shape", () => {
    const bad: string[] = [];
    const walk = (value: unknown, name: string): void => {
      if (value === null || typeof value !== "object") {
        if (typeof value === "string" && REMOVED_WORDS.includes(value)) bad.push(`${name}: "${value}"`);
        return;
      }
      if (Array.isArray(value)) {
        for (const item of value) walk(item, name);
        return;
      }
      for (const [key, v] of Object.entries(value)) {
        if (REMOVED_KEYS.includes(key)) bad.push(`${name}: ${key}`);
        walk(v, name);
      }
    };
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) walk(def, def.name);
    expect(bad).toEqual([]);
  });

  it("never spells the source's host the long way ({ hostOf: \"source\" } is \"attached\")", () => {
    const bad: string[] = [];
    const walk = (value: unknown, name: string): void => {
      if (value === null || typeof value !== "object") return;
      if (Array.isArray(value)) {
        for (const item of value) walk(item, name);
        return;
      }
      const record = value as Record<string, unknown>;
      if (record["hostOf"] === "source") bad.push(name);
      for (const v of Object.values(record)) walk(v, name);
    };
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) walk(def, def.name);
    expect(bad).toEqual([]);
  });

  it("keeps ObjectRef words off a static (only `source` and `attached` read there)", () => {
    const bad: string[] = [];
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) {
      for (const st of def.static ?? []) {
        const scope = st.affects as { readonly filter?: Record<string, unknown> } | undefined;
        const ref = scope?.filter?.["sharesColorWith"] ?? scope?.filter?.["sameNameWith"] ?? scope?.filter?.["attachedToObject"];
        if (ref !== undefined && ref !== "source" && ref !== "attached") bad.push(`${def.name}: ${JSON.stringify(ref)}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
